import { describe, it, expect } from 'vitest';
import { calculerMontantRelais, construireEcheancierRelais } from './pretRelais';

describe('calculerMontantRelais', () => {
  it('70% de 500 000 = 350 000', () => {
    expect(calculerMontantRelais(500000, 70)).toBe(350000);
  });

  it('100% = valeur totale', () => {
    expect(calculerMontantRelais(300000, 100)).toBe(300000);
  });
});

describe('construireEcheancierRelais — franchise partielle', () => {
  const { echeancier, coutTotal } = construireEcheancierRelais(100000, 4, 6, 'franchise-partielle');

  it('contient 6 échéances', () => {
    expect(echeancier).toHaveLength(6);
  });

  it('mensualité = intérêts simples (100 000 × 4%/12)', () => {
    const attendu = 100000 * 0.04 / 12;
    echeancier.forEach(e => expect(e.mensualiteRelais).toBeCloseTo(attendu, 5));
  });

  it('coût total = mensualité × durée', () => {
    const attendu = 100000 * 0.04 / 12 * 6;
    expect(coutTotal).toBeCloseTo(attendu, 2);
  });
});

describe('construireEcheancierRelais — franchise totale', () => {
  const { echeancier, coutTotal } = construireEcheancierRelais(100000, 4, 6, 'franchise-totale');

  it('contient 6 échéances', () => {
    expect(echeancier).toHaveLength(6);
  });

  it('mensualité = 0 (rien payé)', () => {
    echeancier.forEach(e => expect(e.mensualiteRelais).toBe(0));
  });

  it('intérêts capitalisés : chaque mois > mois précédent', () => {
    for (let i = 1; i < echeancier.length; i++) {
      expect(echeancier[i].interetRelais).toBeGreaterThan(echeancier[i - 1].interetRelais);
    }
  });

  it('coût total franchise totale > franchise partielle (capitalisation)', () => {
    const { coutTotal: coutPartielle } = construireEcheancierRelais(100000, 4, 6, 'franchise-partielle');
    expect(coutTotal).toBeGreaterThan(coutPartielle);
  });
});
