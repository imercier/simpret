import { describe, it, expect } from 'vitest';
import { verifierTAEG } from './taeg';
import { construireEcheancier } from './amortissement';

describe('verifierTAEG', () => {
  it('TAEG calculé ≈ taux nominal quand pas d\'assurance ni frais', () => {
    // Sans assurance ni frais, le TAEG doit être ≈ taux nominal
    const ec = construireEcheancier(200000, 3.5, 0, 240, 200000, 'constant');
    const taeg = verifierTAEG(200000, ec);
    expect(taeg).toBeCloseTo(3.5, 1);
  });

  it('TAEG > taux nominal quand assurance présente', () => {
    const ec = construireEcheancier(200000, 3.5, 0.3, 240, 200000, 'constant');
    const taeg = verifierTAEG(200000, ec);
    expect(taeg).toBeGreaterThan(3.5);
  });
});
