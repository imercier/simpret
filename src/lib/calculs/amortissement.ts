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
  typeAmortissement: 'constant' | 'in-fine' = 'constant',
  typeAssurance: 'capital-initial' | 'capital-restant' = 'capital-initial'
): EcheanceAmortissement[] {
  const tm = tauxAnnuel / 100 / 12;
  const tauxAssuranceMensuel = taeaAnnuel / 100 / 12;
  const assuranceFixe = montantInitialPourAssurance * tauxAssuranceMensuel;
  const echeancier: EcheanceAmortissement[] = [];

  if (typeAmortissement === 'in-fine') {
    const interet = capital * tm;
    const mensualite = interet;
    let capitalCourant = capital;
    for (let i = 1; i <= dureeMois; i++) {
      const isDernierMois = i === dureeMois;
      const capitalRembourse = isDernierMois ? capital : 0;
      const assurance = typeAssurance === 'capital-restant'
        ? capitalCourant * tauxAssuranceMensuel
        : assuranceFixe;
      const mensualiteHA = isDernierMois ? mensualite + capital : mensualite;
      capitalCourant = isDernierMois ? 0 : capital;
      echeancier.push({
        mois: i,
        capitalRestantDu: capitalCourant,
        mensualiteHorsAssurance: mensualiteHA,
        partInteret: interet,
        partCapital: capitalRembourse,
        assurance,
        mensualiteTotale: mensualiteHA + assurance,
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
    const assurance = typeAssurance === 'capital-restant'
      ? capitalRestant * tauxAssuranceMensuel
      : assuranceFixe;

    echeancier.push({
      mois: i,
      capitalRestantDu: capitalRestant,
      mensualiteHorsAssurance: mensualite,
      partInteret: interet,
      partCapital: capitalRembourse,
      assurance,
      mensualiteTotale: mensualite + assurance,
      remboursementAnticipe: 0,
    });
  }

  return echeancier;
}
