import type { ScenarioParams, ResultatScenario, EcheanceRelais, BienCommun } from '../types';
import { construireEcheancier } from './amortissement';
import { calculerMontantRelais, construireEcheancierRelais } from './pretRelais';
import { appliquerRemboursementAnticipe } from './remboursementAnticipe';

export function calculerScenario(p: ScenarioParams, bien: BienCommun): ResultatScenario {
  const fraisNotaire = bien.prixBien * (bien.tauxFraisNotaire / 100); // notaire sur prix du bien uniquement
  const produitNetVente = Math.max(0, bien.valeurBienVendu - bien.resteAPayerPretEnCours);

  const dureeMois = p.dureeAns * 12;

  // Prêt relais (calculé avant le montant principal car il l'influe)
  let montantPretRelais = 0;
  let coutPretRelais = 0;
  let echeancierRelais: EcheanceRelais[] = [];
  let dureeEffectiveRelais = 0;

  if (p.pretRelaisActif && bien.valeurBienVendu > 0) {
    montantPretRelais = calculerMontantRelais(bien.valeurBienVendu, p.pretRelaisQuotite);
    dureeEffectiveRelais = Math.min(p.pretRelaisDureeEffectiveMois, p.pretRelaisDureeMois);
    const relais = construireEcheancierRelais(
      montantPretRelais,
      p.pretRelaisTaux,
      dureeEffectiveRelais,
      p.pretRelaisType
    );
    echeancierRelais = relais.echeancier;
    coutPretRelais = relais.coutTotal;
  }

  // Avec relais : la banque avance montantPretRelais, dont une partie sert à rembourser le prêt en cours
  // → l'apport net réel = montantPretRelais − resteAPayerPretEnCours
  // Sans relais : l'apport = produit net de vente (déjà net du remboursement)
  const apportEffectif = p.pretRelaisActif
    ? Math.max(0, montantPretRelais - bien.resteAPayerPretEnCours)
    : produitNetVente;

  // Montant auto : résolution algébrique car la garantie est en % du montant emprunté
  // base = besoin net hors garantie principale
  // M = (base + frais_relais_forfaitaires) / (1 - tauxGarantie/100)
  // frais_relais_forfaitaires = montantRelais × (tauxGarantie + taea) / 100
  // (assurance et garantie du relais sont forfaitaires, financées par le principal)
  const baseFinancement = bien.prixBien + fraisNotaire + bien.fraisAgence + bien.fraisBanque + bien.fraisCourtier - bien.apportPersonnel - apportEffectif;
  const montantEmprunte = p.montantEmprunte > 0
    ? p.montantEmprunte
    : (() => {
        const base = baseFinancement + montantPretRelais * ((bien.tauxGarantie + p.taea) / 100);
        const diviseur = 1 - bien.tauxGarantie / 100;
        return Math.max(0, Math.round(base / diviseur));
      })();

  // Assiette garantie = besoin net hors garantie (pas le montant emprunté qui l'inclut déjà)
  const assieteGarantiePrincipal = p.montantEmprunte > 0
    ? p.montantEmprunte
    : Math.max(0, baseFinancement);

  // Échéancier principal
  let echeancier = construireEcheancier(
    montantEmprunte,
    p.taux,
    p.taea,
    dureeMois,
    montantEmprunte,
    p.typeAmortissement,
    p.typeAssurance
  );

  // Remboursement anticipé
  let mensualiteApres: number | null = null;
  let ira = 0;
  let iraDetail = null;
  if (p.remboursementAnticipeActif && p.remboursementAnticipeMontant > 0) {
    const result = appliquerRemboursementAnticipe(
      echeancier,
      p.remboursementAnticipeMois,
      p.remboursementAnticipeMontant,
      p.remboursementAnticipeConsequence,
      p.taux,
      p.taea,
      montantEmprunte,
      p.iraActif,
      p.typeAssurance
    );
    echeancier = result.echeancier;
    mensualiteApres = result.mensualiteApres;
    ira = result.ira;
    iraDetail = result.iraDetail;
  }

  // Coûts
  const coutInterets = echeancier.reduce((s, e) => s + e.partInteret, 0);
  const coutAssurance = echeancier.reduce((s, e) => s + e.assurance, 0);

  // Assurance relais : forfait montantRelais × taea/100 × duree/12
  const coutAssuranceRelais = montantPretRelais * (p.taea / 100) * (dureeEffectiveRelais / 12);
  const coutGarantiePrincipal = assieteGarantiePrincipal * (bien.tauxGarantie / 100);
  const coutGarantieRelais = montantPretRelais * (bien.tauxGarantie / 100);
  const coutGarantie = coutGarantiePrincipal + coutGarantieRelais;
  const fraisCommuns = bien.fraisBanque + bien.fraisCourtier;
  const sousTotalPrincipal = coutInterets + coutAssurance + coutGarantiePrincipal + ira;
  const sousTotalRelais = coutPretRelais + coutAssuranceRelais + coutGarantieRelais;
  const sousTotal = sousTotalPrincipal + sousTotalRelais + fraisCommuns;

  const detailMontantEmprunte = {
    estManuel: p.montantEmprunte > 0,
    prixBien: bien.prixBien,
    fraisNotaire,
    fraisAgence: bien.fraisAgence,
    apportPersonnel: bien.apportPersonnel,
    apportEffectif,
    labelApportEffectif: p.pretRelaisActif ? 'Relais net (après remb. prêt en cours)' : 'Produit net de vente',
    coutGarantie,
    assieteGarantiePrincipal,
    fraisBanque: bien.fraisBanque,
    fraisCourtier: bien.fraisCourtier,
    tauxGarantie: bien.tauxGarantie,
    taea: p.taea,
  };

  return {
    scenarioId: p.id,
    bien,
    mensualiteInitiale: echeancier[0]?.mensualiteTotale ?? 0,
    mensualiteApresRemboursement: mensualiteApres,
    dureeTotaleMois: echeancier.length,
    montantPretRelais,
    montantEmprunte,
    detailMontantEmprunte,
    couts: {
      coutInterets,
      coutAssurance,
      coutAssuranceRelais,
      coutGarantie,
      coutGarantiePrincipal,
      coutGarantieRelais,
      fraisBanque: bien.fraisBanque,
      fraisCourtier: bien.fraisCourtier,
      coutPretRelais,
      ira,
      sousTotalPrincipal,
      sousTotalRelais,
      fraisCommuns,
      sousTotal,
    },
    echeancier,
    echeancierRelais,
    iraDetail,
  };
}

export function creerScenarioDefaut(): ScenarioParams {
  return {
    id: crypto.randomUUID(),
    nom: 'Scénario 1',
    montantEmprunte: 0,
    dureeAns: 12,
    taux: 3.5,
    taea: 0.5,
    typeAssurance: 'capital-initial',
    typeAmortissement: 'constant',
    pretRelaisActif: false,
    pretRelaisQuotite: 70,
    pretRelaisDureeMois: 12,
    pretRelaisDureeEffectiveMois: 3,
    pretRelaisTaux: 4.0,
    pretRelaisType: 'franchise-partielle',
    remboursementAnticipeActif: false,
    remboursementAnticipeMois: 60,
    remboursementAnticipeMontant: 20000,
    remboursementAnticipeConsequence: 'reduire-duree',
    iraActif: true,
  };
}
