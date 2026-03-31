import type { EcheanceAmortissement } from '../types';

export function calculerMensualite(capital: number, tauxAnnuel: number, dureeMois: number): number {
  if (tauxAnnuel === 0) return capital / dureeMois;
  const tm = tauxAnnuel / 100 / 12;
  return capital * tm / (1 - Math.pow(1 + tm, -dureeMois));
}

export function construireEcheancier(
  capital: number,
  tauxAnnuel: number,
  taeaAnnuel: number,
  dureeMois: number,
  montantInitialPourAssurance: number,
  typeAmortissement: 'constant' | 'in-fine' = 'constant'
): EcheanceAmortissement[] {
  const tm = tauxAnnuel / 100 / 12;
  const assuranceMensuelle = montantInitialPourAssurance * (taeaAnnuel / 100 / 12);
  const echeancier: EcheanceAmortissement[] = [];

  if (typeAmortissement === 'in-fine') {
    const interet = capital * tm;
    const mensualite = interet; // capital remboursé uniquement à l'échéance
    for (let i = 1; i <= dureeMois; i++) {
      const isDernierMois = i === dureeMois;
      const capitalRembourse = isDernierMois ? capital : 0;
      echeancier.push({
        mois: i,
        capitalRestantDu: isDernierMois ? 0 : capital,
        mensualiteHorsAssurance: isDernierMois ? mensualite + capital : mensualite,
        partInteret: interet,
        partCapital: capitalRembourse,
        assurance: assuranceMensuelle,
        mensualiteTotale: (isDernierMois ? mensualite + capital : mensualite) + assuranceMensuelle,
        remboursementAnticipe: 0,
      });
    }
    return echeancier;
  }

  // Amortissement constant
  const mensualite = calculerMensualite(capital, tauxAnnuel, dureeMois);
  let capitalRestant = capital;

  for (let i = 1; i <= dureeMois; i++) {
    const interet = capitalRestant * tm;
    const capitalRembourse = Math.min(mensualite - interet, capitalRestant);
    capitalRestant = Math.max(0, capitalRestant - capitalRembourse);

    echeancier.push({
      mois: i,
      capitalRestantDu: capitalRestant,
      mensualiteHorsAssurance: mensualite,
      partInteret: interet,
      partCapital: capitalRembourse,
      assurance: assuranceMensuelle,
      mensualiteTotale: mensualite + assuranceMensuelle,
      remboursementAnticipe: 0,
    });
  }

  return echeancier;
}
