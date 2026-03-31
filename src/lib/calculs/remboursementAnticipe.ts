import type { EcheanceAmortissement } from '../types';
import { construireEcheancier } from './amortissement';

export function calculerIRA(montantRembourse: number, tauxAnnuel: number): number {
  const option1 = montantRembourse * 0.03;
  const option2 = montantRembourse * (tauxAnnuel / 100 / 12) * 6;
  return Math.min(option1, option2);
}

export function appliquerRemboursementAnticipe(
  echeancier: EcheanceAmortissement[],
  moisRA: number,
  montantRA: number,
  consequence: 'reduire-duree' | 'reduire-mensualite',
  tauxAnnuel: number,
  taeaAnnuel: number,
  montantInitialPourAssurance: number,
  iraActif: boolean
): { echeancier: EcheanceAmortissement[]; mensualiteApres: number | null } {
  if (moisRA < 1 || moisRA > echeancier.length) {
    return { echeancier, mensualiteApres: null };
  }

  const echeancierAvant = echeancier.slice(0, moisRA);
  const capitalAvantRA = echeancier[moisRA - 1].capitalRestantDu;
  const ira = iraActif ? calculerIRA(montantRA, tauxAnnuel) : 0;
  const nouveauCapital = Math.max(0, capitalAvantRA - montantRA + ira);

  echeancierAvant[moisRA - 1] = {
    ...echeancierAvant[moisRA - 1],
    remboursementAnticipe: montantRA,
  };

  if (nouveauCapital === 0) {
    return { echeancier: echeancierAvant, mensualiteApres: 0 };
  }

  const moisRestants = echeancier.length - moisRA;
  const mensualiteInitiale = echeancier[0].mensualiteHorsAssurance;
  const tm = tauxAnnuel / 100 / 12;

  let suite: EcheanceAmortissement[];
  let mensualiteApres: number;

  if (consequence === 'reduire-duree') {
    const nNouveau = tm === 0
      ? Math.ceil(nouveauCapital / mensualiteInitiale)
      : Math.ceil(-Math.log(1 - nouveauCapital * tm / mensualiteInitiale) / Math.log(1 + tm));
    suite = construireEcheancier(nouveauCapital, tauxAnnuel, taeaAnnuel, nNouveau, montantInitialPourAssurance);
    mensualiteApres = mensualiteInitiale;
  } else {
    suite = construireEcheancier(nouveauCapital, tauxAnnuel, taeaAnnuel, moisRestants, montantInitialPourAssurance);
    mensualiteApres = suite[0]?.mensualiteHorsAssurance ?? 0;
  }

  suite = suite.map((e, i) => ({ ...e, mois: moisRA + i + 1 }));

  return { echeancier: [...echeancierAvant, ...suite], mensualiteApres };
}
