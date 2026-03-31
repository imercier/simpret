<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import type { EcheanceAmortissement } from '../lib/types';
  import Chart from 'chart.js/auto';

  export let echeancier: EcheanceAmortissement[];

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  function buildChart() {
    if (!canvas || echeancier.length === 0) return;
    if (chart) chart.destroy();

    const step = Math.max(1, Math.floor(echeancier.length / 60));
    const sampled = echeancier.filter((_, i) => i % step === 0);
    const labels = sampled.map(e => `M${e.mois}`);

    let cumInt = 0, cumAss = 0;

    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Capital restant dû',
            data: sampled.map(e => Math.round(e.capitalRestantDu)),
            borderColor: '#1a5276',
            backgroundColor: '#1a527618',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            yAxisID: 'y',
          },
          {
            label: 'Intérêts cumulés',
            data: sampled.map(e => { cumInt += e.partInteret; return Math.round(cumInt); }),
            borderColor: '#e74c3c',
            backgroundColor: '#e74c3c18',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            yAxisID: 'y',
          },
          {
            label: 'Assurance cumulée',
            data: sampled.map(e => { cumAss += e.assurance; return Math.round(cumAss); }),
            borderColor: '#f39c12',
            backgroundColor: '#f39c1218',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            yAxisID: 'y',
          },
        ],
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'bottom' } },
        scales: {
          y: {
            ticks: {
              callback: v => `${(+v / 1000).toFixed(0)} k€`,
            },
          },
        },
      },
    });
  }

  onMount(buildChart);
  onDestroy(() => chart?.destroy());

  $: if (canvas && echeancier) {
    buildChart();
  }
</script>

<div class="chart-wrap">
  <h3>Évolution du prêt</h3>
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .chart-wrap {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
  }
  h3 {
    margin: 0 0 0.75rem;
    font-size: 0.85rem;
    color: #1a5276;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
