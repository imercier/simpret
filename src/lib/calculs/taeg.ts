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

  // Méthode actuarielle équivalente — Directive MCD 2014/17/UE
  // Art. R314-1 Code de la consommation (applicable depuis le 01/10/2016)
  return (Math.pow(1 + i, 12) - 1) * 100;
}
