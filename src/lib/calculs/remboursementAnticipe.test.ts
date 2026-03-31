import { describe, it, expect } from 'vitest';
import { calculerIRA, appliquerRemboursementAnticipe } from './remboursementAnticipe';
import { construireEcheancier } from './amortissement';

describe('calculerIRA', () => {
  it('retourne le minimum des deux plafonds', () => {
    // capital restant 100 000, remboursé 50 000, taux 3.5%
    // plafond 3% = 100 000 × 3% = 3 000
    // plafond 6 mois = 50 000 × (3.5%/12) × 6 = 875
    const { ira, plafond3pct, plafond6mois } = calculerIRA(100000, 50000, 3.5);
    expect(plafond3pct).toBeCloseTo(3000, 2);
    expect(plafond6mois).toBeCloseTo(875, 2);
    expect(ira).toBeCloseTo(875, 2);
  });

  it('plafond 3% retenu quand 6 mois > 3%', () => {
    // taux très élevé pour que 6 mois > 3%
    // capital restant 100 000, remboursé 100 000, taux 10%
    // plafond 3% = 100 000 × 3% = 3 000
    // plafond 6 mois = 100 000 × (10%/12) × 6 = 5 000
    const { ira } = calculerIRA(100000, 100000, 10);
    expect(ira).toBeCloseTo(3000, 2);
  });

  it('plafond 3% appliqué sur capital restant dû, pas sur montant remboursé', () => {
    // capital restant 200 000, remboursé 50 000
    const { plafond3pct } = calculerIRA(200000, 50000, 3.5);
    expect(plafond3pct).toBeCloseTo(6000, 2); // 200 000 × 3%
  });
});

describe('appliquerRemboursementAnticipe', () => {
  const echeancierBase = construireEcheancier(200000, 3.5, 0, 240, 200000, 'constant');

  it('mois invalide : retourne l\'échéancier inchangé', () => {
    const { echeancier } = appliquerRemboursementAnticipe(echeancierBase, 0, 50000, 'reduire-duree', 3.5, 0, 200000, false);
    expect(echeancier).toHaveLength(240);
  });

  it('réduire-duree : mensualité inchangée, durée raccourcie', () => {
    const { echeancier, mensualiteApres } = appliquerRemboursementAnticipe(echeancierBase, 60, 50000, 'reduire-duree', 3.5, 0, 200000, false);
    expect(echeancier.length).toBeLessThan(240);
    expect(mensualiteApres).toBeCloseTo(echeancierBase[0].mensualiteHorsAssurance, 0);
  });

  it('réduire-mensualite : durée inchangée, mensualité réduite', () => {
    const { echeancier, mensualiteApres } = appliquerRemboursementAnticipe(echeancierBase, 60, 50000, 'reduire-mensualite', 3.5, 0, 200000, false);
    expect(echeancier.length).toBeLessThanOrEqual(240);
    expect(mensualiteApres).toBeLessThan(echeancierBase[0].mensualiteHorsAssurance);
  });

  it('sans IRA : ira = 0', () => {
    const { ira } = appliquerRemboursementAnticipe(echeancierBase, 60, 50000, 'reduire-duree', 3.5, 0, 200000, false);
    expect(ira).toBe(0);
  });

  it('avec IRA : ira > 0', () => {
    const { ira } = appliquerRemboursementAnticipe(echeancierBase, 60, 50000, 'reduire-duree', 3.5, 0, 200000, true);
    expect(ira).toBeGreaterThan(0);
  });

  it('remboursement total : échéancier tronqué au mois du remboursement', () => {
    const capitalAuMois60 = echeancierBase[59].capitalRestantDu;
    const { echeancier } = appliquerRemboursementAnticipe(echeancierBase, 60, capitalAuMois60, 'reduire-duree', 3.5, 0, 200000, false);
    expect(echeancier).toHaveLength(60);
  });
});
