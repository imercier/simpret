import type { ScenarioParams, ResultatScenario, EcheanceRelais, BienCommun } from '../types';
import { construireEcheancier } from './amortissement';
import { calculerMontantRelais, construireEcheancierRelais } from './pretRelais';
import { appliquerRemboursementAnticipe } from './remboursementAnticipe';

export function calculerScenario(p: ScenarioParams, bien: BienCommun): ResultatScenario {
  const fraisNotaire = bien.prixBien * (bien.tauxFraisNotaire / 100);
  const fraisAnnexesTotaux = p.fraisAnnexes + (p.pretRelaisActif ? p.pretRelaisfraisAnnexes : 0);
  const produitNetVente = Math.max(0, bien.valeurBienVendu - bien.resteAPayerPretEnCours);

  const dureeMois = p.dureeAns * 12;

  // Prêt relais (calculé avant le montant principal car il l'influe)
  let montantPretRelais = 0;
  let coutPretRelais = 0;
  let echeancierRelais: EcheanceRelais[] = [];

  if (p.pretRelaisActif && bien.valeurBienVendu > 0) {
    montantPretRelais = calculerMontantRelais(bien.valeurBienVendu, p.pretRelaisQuotite);
    const dureeEffective = Math.min(p.pretRelaisDureeEffectiveMois, p.pretRelaisDureeMois);
    const relais = construireEcheancierRelais(
      montantPretRelais,
      p.pretRelaisTaux,
      dureeEffective,
      p.pretRelaisType
    );
    echeancierRelais = relais.echeancier;
    coutPretRelais = relais.coutTotal;
  }

  // Montant principal : avec relais, la banque avance déjà montantRelais sur le bien à vendre
  // → on déduit le montantRelais (et non le produitNetVente total)
  const apportEffectif = p.pretRelaisActif ? montantPretRelais : produitNetVente;
  const montantEmprunte = p.montantEmprunte > 0
    ? p.montantEmprunte
    : Math.max(0, bien.prixBien + fraisNotaire + fraisAnnexesTotaux - bien.apportPersonnel - apportEffectif);

  // Échéancier principal
  let echeancier = construireEcheancier(
    montantEmprunte,
    p.taeg,
    p.taea,
    dureeMois,
    montantEmprunte,
    p.typeAmortissement
  );

  // Remboursement anticipé
  let mensualiteApres: number | null = null;
  let ira = 0;
  if (p.remboursementAnticipeActif && p.remboursementAnticipeMontant > 0) {
    const result = appliquerRemboursementAnticipe(
      echeancier,
      p.remboursementAnticipeMois,
      p.remboursementAnticipeMontant,
      p.remboursementAnticipeConsequence,
      p.taeg,
      p.taea,
      montantEmprunte,
      p.iraActif
    );
    echeancier = result.echeancier;
    mensualiteApres = result.mensualiteApres;
    ira = result.ira;
  }

  // Coûts
  const coutInterets = echeancier.reduce((s, e) => s + e.partInteret, 0);
  const coutAssurance = echeancier.reduce((s, e) => s + e.assurance, 0);
  const fraisAnnexesRelais = p.pretRelaisActif ? p.pretRelaisfraisAnnexes : 0;
  const sousTotal = coutInterets + coutAssurance + p.fraisAnnexes + coutPretRelais + fraisAnnexesRelais + ira;

  return {
    scenarioId: p.id,
    bien,
    mensualiteInitiale: echeancier[0]?.mensualiteTotale ?? 0,
    mensualiteApresRemboursement: mensualiteApres,
    dureeTotaleMois: echeancier.length,
    montantPretRelais,
    montantEmprunte,
    couts: {
      coutInterets,
      coutAssurance,
      fraisAnnexes: p.fraisAnnexes,
      coutPretRelais,
      fraisAnnexesRelais,
      ira,
      sousTotal,
    },
    echeancier,
    echeancierRelais,
  };
}

export function creerScenarioDefaut(): ScenarioParams {
  return {
    id: crypto.randomUUID(),
    nom: 'Scénario 1',
    montantEmprunte: 0,
    dureeAns: 12,
    taeg: 3.5,
    taea: 0.5,
    typeAmortissement: 'constant',
    fraisAnnexes: 2000,
    pretRelaisActif: false,
    pretRelaisQuotite: 70,
    pretRelaisDureeMois: 12,
    pretRelaisDureeEffectiveMois: 3,
    pretRelaisTaux: 4.0,
    pretRelaisType: 'franchise-partielle',
    pretRelaisfraisAnnexes: 500,
    remboursementAnticipeActif: false,
    remboursementAnticipeMois: 60,
    remboursementAnticipeMontant: 20000,
    remboursementAnticipeConsequence: 'reduire-duree',
    iraActif: true,
  };
}
