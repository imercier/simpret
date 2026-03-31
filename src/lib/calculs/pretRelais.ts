import type { EcheanceRelais } from '../types';

export function calculerMontantRelais(valeurBien: number, quotite: number): number {
  return valeurBien * (quotite / 100);
}

export function construireEcheancierRelais(
  montant: number,
  tauxAnnuel: number,
  dureeMois: number,
  type: 'franchise-totale' | 'franchise-partielle'
): { echeancier: EcheanceRelais[]; coutTotal: number } {
  const tm = tauxAnnuel / 100 / 12;
  const echeancier: EcheanceRelais[] = [];

  if (type === 'franchise-totale') {
    // Intérêts capitalisés : le capital grossit chaque mois, rien n'est payé
    let capitalCourant = montant;
    let coutTotal = 0;
    for (let i = 1; i <= dureeMois; i++) {
      const interetMois = capitalCourant * tm;
      coutTotal += interetMois;
      capitalCourant += interetMois;
      echeancier.push({ mois: i, mensualiteRelais: 0, interetRelais: interetMois });
    }
    return { echeancier, coutTotal };
  } else {
    const interetMensuel = montant * tm;
    for (let i = 1; i <= dureeMois; i++) {
      echeancier.push({ mois: i, mensualiteRelais: interetMensuel, interetRelais: interetMensuel });
    }
    return { echeancier, coutTotal: interetMensuel * dureeMois };
  }
}
