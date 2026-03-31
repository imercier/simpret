<script lang="ts">
  import { resultats, scenarios } from '../lib/stores/simulation';
  import { formatEUR, formatMois } from '../lib/utils/format';
  import { onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  type Pair = { nom: string; r: import('../lib/types').ResultatScenario };

  $: pairs = $scenarios.map((s, i) => ({ nom: s.nom, r: $resultats[i] })).filter(p => p.r) as Pair[];

  $: lignes = pairs.length === 0 ? [] : [
    ['Mensualité initiale',      pairs.map(p => formatEUR(p.r.mensualiteInitiale))],
    ['Durée effective',          pairs.map(p => formatMois(p.r.dureeTotaleMois))],
    ['Capital emprunté',         pairs.map(p => formatEUR(p.r.montantEmprunte))],
    ['Coût des intérêts',        pairs.map(p => formatEUR(p.r.couts.coutInterets))],
    ['Coût assurance (TAEA)',    pairs.map(p => formatEUR(p.r.couts.coutAssurance))],
    ['Frais annexes',            pairs.map(p => formatEUR(p.r.couts.fraisAnnexes))],
    ...(pairs.some(p => p.r.couts.coutPretRelais > 0) ? [['Intérêts relais', pairs.map(p => p.r.couts.coutPretRelais > 0 ? formatEUR(p.r.couts.coutPretRelais) : '—')]] : []),
    ...(pairs.some(p => p.r.couts.fraisAnnexesRelais > 0) ? [['Frais annexes relais', pairs.map(p => p.r.couts.fraisAnnexesRelais > 0 ? formatEUR(p.r.couts.fraisAnnexesRelais) : '—')]] : []),
    ...(pairs.some(p => p.r.couts.ira > 0) ? [['IRA (art. L313-47)', pairs.map(p => p.r.couts.ira > 0 ? formatEUR(p.r.couts.ira) : '—')]] : []),
    ['Sous-total crédit',        pairs.map(p => formatEUR(p.r.couts.sousTotal))],
  ] as [string, string[]][];

  const isSousTotal = (label: string) => label === 'Sous-total crédit';

  function buildChart() {
    if (!canvas || pairs.length === 0) return;
    if (chart) chart.destroy();
    chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: pairs.map(p => p.nom),
        datasets: [
          { label: 'Intérêts',      data: pairs.map(p => p.r.couts.coutInterets),      backgroundColor: '#e74c3c' },
          { label: 'Assurance',     data: pairs.map(p => p.r.couts.coutAssurance),     backgroundColor: '#f39c12' },
          { label: 'Frais annexes', data: pairs.map(p => p.r.couts.fraisAnnexes),      backgroundColor: '#95a5a6' },
          { label: 'Frais relais',  data: pairs.map(p => p.r.couts.fraisAnnexesRelais + p.r.couts.coutPretRelais), backgroundColor: '#2980b9' },
          { label: 'IRA',           data: pairs.map(p => p.r.couts.ira),                                            backgroundColor: '#8e44ad' },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Coût du crédit hors bien et notaire', font: { size: 12 } },
        },
        scales: {
          x: { stacked: true },
          y: { stacked: true, ticks: { callback: v => `${(+v / 1000).toFixed(0)} k€` } },
        },
      },
    });
  }

  onDestroy(() => chart?.destroy());
  $: if (canvas && pairs) buildChart();
</script>

<div class="comparaison">
  <h2>Comparaison des scénarios</h2>

  {#if pairs.length < 2}
    <p class="hint">Ajoutez au moins 2 scénarios pour comparer.</p>
  {:else}
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="left">Indicateur</th>
            {#each pairs as p}
              <th>{p.nom}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each lignes as [label, valeurs]}
            <tr class:subtotal={isSousTotal(label)}>
              <td class="left label">{label}</td>
              {#each valeurs as val}
                <td>{val}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="chart-wrap">
      <h3>Coût du crédit hors bien et notaire</h3>
      <canvas bind:this={canvas}></canvas>
    </div>
  {/if}
</div>

<style>
  .comparaison { max-width: 100%; }
  h2 { color: #1a5276; margin: 0 0 1rem; }
  h3 { margin: 0 0 0.75rem; font-size: 0.85rem; color: #1a5276; text-transform: uppercase; letter-spacing: 0.05em; }
  .hint { color: #888; font-style: italic; }
  .table-wrap { overflow-x: auto; margin-bottom: 1.5rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th {
    background: #1a5276;
    color: white;
    padding: 0.5rem 0.75rem;
    text-align: right;
    white-space: nowrap;
  }
  th.left { text-align: left; }
  td {
    padding: 0.4rem 0.75rem;
    border-bottom: 1px solid #f0f0f0;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  td.left { text-align: left; color: #555; white-space: nowrap; }
  td.label { font-size: 0.82rem; }
  tr.subtotal td { background: #ebf5fb; font-weight: 600; border-top: 2px solid #2980b9; border-bottom: 2px solid #2980b9; }
  .chart-wrap {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    max-width: 800px;
  }
</style>
