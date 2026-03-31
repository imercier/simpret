export interface BienCommun {
  prixBien: number;
  apportPersonnel: number;
  tauxFraisNotaire: number; // % ex: 7.5
  valeurBienVendu: number;  // € bien à vendre
  resteAPayerPretEnCours: number; // € capital restant dû sur le prêt du bien à vendre
  revenusMensuels: number;  // € revenus mensuels nets pour calcul taux d'endettement
  tauxGarantie: number;            // % du capital emprunté ex: 1.5
  fraisBanque: number;             // € frais de dossier banque
  fraisCourtier: number;           // € frais courtier
  fraisAgence: number;             // € frais d'agence (hors notaire, inclus dans le financement)
}

export interface ScenarioParams {
  id: string;
  nom: string;

  // Prêt principal
  montantEmprunte: number; // 0 = auto-calculé
  dureeAns: number;
  taux: number;  // % annuel (taux nominal hors assurance)
  taea: number;  // % annuel assurance (s'applique aussi au relais)
  typeAssurance: 'capital-initial' | 'capital-restant';  // groupe bancaire vs délégation
  typeAmortissement: 'constant' | 'in-fine';

  // Frais annexes
  // Prêt relais
  pretRelaisActif: boolean;
  pretRelaisQuotite: number;              // % ex: 70 → montant = valeurBien * quotite/100
  pretRelaisDureeMois: number;            // durée contractuelle max du relais
  pretRelaisDureeEffectiveMois: number;   // durée effective réelle (vente du bien) — utilisée pour le coût
  pretRelaisTaux: number;                 // % annuel
  pretRelaisType: 'franchise-totale' | 'franchise-partielle';
  pretRelaisfraisAnnexes?: number;        // € — conservé pour rétrocompatibilité localStorage

  // Remboursement anticipé
  remboursementAnticipeActif: boolean;
  remboursementAnticipeMois: number;
  remboursementAnticipeMontant: number;
  remboursementAnticipeConsequence: 'reduire-duree' | 'reduire-mensualite';
  iraActif: boolean;
}

export interface EcheanceAmortissement {
  mois: number;
  capitalRestantDu: number;
  mensualiteHorsAssurance: number;
  partInteret: number;
  partCapital: number;
  assurance: number;
  mensualiteTotale: number;
  remboursementAnticipe: number;
}

export interface EcheanceRelais {
  mois: number;
  mensualiteRelais: number;
  interetRelais: number;
}

export interface CoutsGlobaux {
  coutInterets: number;
  coutAssurance: number;          // assurance mensuelle du prêt principal (via taea, échéancier)
  coutAssuranceRelais: number;    // assurance forfaitaire du relais (montantRelais × taea × duree)
  coutGarantie: number;
  coutGarantiePrincipal: number;
  coutGarantieRelais: number;
  fraisBanque: number;
  fraisCourtier: number;
  coutPretRelais: number;
  ira: number;
  sousTotalPrincipal: number;
  sousTotalRelais: number;
  fraisCommuns: number;
  sousTotal: number;
}

export interface IRADetail {
  plafond3pct: number;
  plafond6mois: number;
}

export interface DetailMontantEmprunte {
  estManuel: boolean;
  prixBien: number;
  fraisNotaire: number;
  fraisAgence: number;
  apportPersonnel: number;
  apportEffectif: number;
  labelApportEffectif: string;
  coutGarantie: number;
  assieteGarantiePrincipal: number;
  fraisBanque: number;
  fraisCourtier: number;
  tauxGarantie: number;
  taea: number;
}

export interface ResultatScenario {
  scenarioId: string;
  bien: BienCommun;
  mensualiteInitiale: number;
  mensualiteApresRemboursement: number | null;
  dureeTotaleMois: number;
  montantPretRelais: number;
  montantEmprunte: number;
  detailMontantEmprunte: DetailMontantEmprunte;
  couts: CoutsGlobaux;
  echeancier: EcheanceAmortissement[];
  echeancierRelais: EcheanceRelais[];
  iraDetail: IRADetail | null;
}
