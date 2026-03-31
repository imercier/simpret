import { describe, it, expect } from 'vitest';
import { calculerMensualite, construireEcheancier } from './amortissement';

describe('calculerMensualite', () => {
  it('calcule la mensualité standard (200k€, 3.5%, 20 ans)', () => {
    expect(calculerMensualite(200000, 3.5, 240)).toBeCloseTo(1159.92, 0);
  });

  it('taux 0% : mensualité = capital / durée', () => {
    expect(calculerMensualite(120000, 0, 120)).toBeCloseTo(1000, 5);
  });
});

describe('construireEcheancier — amortissement constant', () => {
  const echeancier = construireEcheancier(200000, 3.5, 0, 240, 200000, 'constant');

  it('contient 240 échéances', () => {
    expect(echeancier).toHaveLength(240);
  });

  it('premier mois : capital restant dû < 200 000', () => {
    expect(echeancier[0].capitalRestantDu).toBeLessThan(200000);
  });

  it('dernier mois : capital restant dû ≈ 0', () => {
    expect(echeancier[239].capitalRestantDu).toBeCloseTo(0, 0);
  });

  it('mensualité constante sur toute la durée', () => {
    const m0 = echeancier[0].mensualiteHorsAssurance;
    echeancier.forEach(e => {
      expect(e.mensualiteHorsAssurance).toBeCloseTo(m0, 5);
    });
  });

  it('somme des parts capital ≈ capital initial', () => {
    const totalCapital = echeancier.reduce((s, e) => s + e.partCapital, 0);
    expect(totalCapital).toBeCloseTo(200000, 0);
  });

  it('assurance = 0 quand TAEA = 0', () => {
    echeancier.forEach(e => expect(e.assurance).toBe(0));
  });

  it('assurance calculée sur capital initial (TAEA 0.3%)', () => {
    const ec = construireEcheancier(200000, 3.5, 0.3, 240, 200000, 'constant', 'capital-initial');
    const assuranceAttendue = 200000 * 0.003 / 12;
    ec.forEach(e => expect(e.assurance).toBeCloseTo(assuranceAttendue, 5));
  });

  it('assurance décroissante sur capital restant dû (délégation)', () => {
    const ec = construireEcheancier(200000, 3.5, 0.3, 240, 200000, 'constant', 'capital-restant');
    // prime du mois 1 > prime du dernier mois
    expect(ec[0].assurance).toBeGreaterThan(ec[239].assurance);
  });

  it('coût total assurance délégation < capital initial', () => {
    const ecInitial = construireEcheancier(200000, 3.5, 0.3, 240, 200000, 'constant', 'capital-initial');
    const ecRestant = construireEcheancier(200000, 3.5, 0.3, 240, 200000, 'constant', 'capital-restant');
    const coutInitial = ecInitial.reduce((s, e) => s + e.assurance, 0);
    const coutRestant = ecRestant.reduce((s, e) => s + e.assurance, 0);
    expect(coutRestant).toBeLessThan(coutInitial);
  });
});

describe('construireEcheancier — in-fine', () => {
  const ec = construireEcheancier(100000, 3.5, 0, 12, 100000, 'in-fine');

  it('contient 12 échéances', () => {
    expect(ec).toHaveLength(12);
  });

  it('capital restant dû = 100 000 jusqu\'au dernier mois', () => {
    ec.slice(0, 11).forEach(e => expect(e.capitalRestantDu).toBe(100000));
  });

  it('dernier mois : capital restant dû = 0', () => {
    expect(ec[11].capitalRestantDu).toBe(0);
  });

  it('intérêts constants chaque mois', () => {
    const i0 = ec[0].partInteret;
    ec.forEach(e => expect(e.partInteret).toBeCloseTo(i0, 5));
  });
});
