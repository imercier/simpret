<script lang="ts">
  import { resultats, scenarios } from '../lib/stores/simulation';

  export let scenarioId: string;

  $: res = $resultats.find(r => r.scenarioId === scenarioId);
  $: sc = $scenarios.find(s => s.id === scenarioId);

  function exportCSV() {
    if (!res || !sc) return;
    const sep = ';';
    const header = ['Mois','Capital restant','Mensualité','Intérêts','Capital','Assurance','Total','Remb. anticipé'];
    const rows = res.echeancier.map(e => [
      e.mois,
      e.capitalRestantDu.toFixed(2),
      e.mensualiteHorsAssurance.toFixed(2),
      e.partInteret.toFixed(2),
      e.partCapital.toFixed(2),
      e.assurance.toFixed(2),
      e.mensualiteTotale.toFixed(2),
      e.remboursementAnticipe.toFixed(2),
    ]);
    const csv = [header, ...rows].map(r => r.join(sep)).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `simpret-${sc.nom}.csv`;
    a.click();
  }
</script>

<div class="export-bar">
  <button class="btn-csv" on:click={exportCSV}>⬇ CSV</button>
</div>

<style>
  .export-bar { display: flex; gap: 0.5rem; }
  button {
    padding: 0.4rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.82rem;
    border: 1px solid;
  }
  .btn-csv { border-color: #27ae60; color: #27ae60; background: white; }
  .btn-csv:hover { background: #27ae60; color: white; }
</style>
