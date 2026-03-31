export interface BienCommun {
  prixBien: number;
  apportPersonnel: number;
  tauxFraisNotaire: number; // % ex: 7.5
  valeurBienVendu: number;  // € bien à vendre
  resteAPayerPretEnCours: number; // € capital restant dû sur le prêt du bien à vendre
  revenusMensuels: number;  // € revenus mensuels nets pour calcul taux d'endettement
}

export interface ScenarioParams {
  id: string;
  nom: string;

  // Prêt principal
  montantEmprunte: number; // 0 = auto-calculé
  dureeAns: number;
  taeg: number;  // % annuel
  taea: number;  // % annuel assurance
  typeAmortissement: 'constant' | 'in-fine';

  // Frais annexes
  fraisAnnexes: number; // € — dossier, garantie, courtier…

  // Prêt relais
  pretRelaisActif: boolean;
  pretRelaisQuotite: number;              // % ex: 70 → montant = valeurBien * quotite/100
  pretRelaisDureeMois: number;            // durée contractuelle max du relais
  pretRelaisDureeEffectiveMois: number;   // durée effective réelle (vente du bien) — utilisée pour le coût
  pretRelaisTaux: number;                 // % annuel
  pretRelaisType: 'franchise-totale' | 'franchise-partielle';
  pretRelaisfraisAnnexes: number;         // € — frais de dossier relais, garantie…

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
  coutAssurance: number;
  fraisAnnexes: number;
  coutPretRelais: number;        // intérêts relais
  fraisAnnexesRelais: number;    // frais annexes du relais
  ira: number;                   // indemnités de remboursement anticipé
  sousTotal: number;             // intérêts + assurance + fraisAnnexes + relais + IRA
}

export interface ResultatScenario {
  scenarioId: string;
  bien: BienCommun;
  mensualiteInitiale: number;
  mensualiteApresRemboursement: number | null;
  dureeTotaleMois: number;
  montantPretRelais: number;
  montantEmprunte: number;
  couts: CoutsGlobaux;
  echeancier: EcheanceAmortissement[];
  echeancierRelais: EcheanceRelais[];
}
