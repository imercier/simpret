const EUR = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export const formatEUR = (v: number) => EUR.format(v);

export const formatPCT = (v: number) =>
  v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

export const formatMois = (m: number): string => {
  const ans = Math.floor(m / 12);
  const mois = m % 12;
  if (ans === 0) return `${mois} mois`;
  if (mois === 0) return `${ans} an${ans > 1 ? 's' : ''}`;
  return `${ans} an${ans > 1 ? 's' : ''} ${mois} mois`;
};
