export function verifierTAEG(
  capitalNet: number,
  echeancier: { mensualiteTotale: number }[]
): number {
  let i = 0.003;

  for (let iter = 0; iter < 200; iter++) {
    let f = -capitalNet;
    let df = 0;
    echeancier.forEach((e, k) => {
      const disc = Math.pow(1 + i, k + 1);
      f += e.mensualiteTotale / disc;
      df -= (k + 1) * e.mensualiteTotale / (disc * (1 + i));
    });
    if (Math.abs(df) < 1e-12) break;
    const delta = f / df;
    i -= delta;
    if (Math.abs(delta) < 1e-10) break;
  }

  return i * 12 * 100;
}
