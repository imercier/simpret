<script lang="ts">
  import type { EcheanceAmortissement, EcheanceRelais } from '../lib/types';
  import { formatEUR } from '../lib/utils/format';

  export let echeancier: EcheanceAmortissement[];
  export let echeancierRelais: EcheanceRelais[];

  let afficherRelais = false;
  let recherche = '';
  let pageSize = 24;
  let page = 0;

  $: filtered = recherche
    ? echeancier.filter(e => e.mois.toString().includes(recherche))
    : echeancier;
  $: pages = Math.ceil(filtered.length / pageSize);
  $: visible = filtered.slice(page * pageSize, (page + 1) * pageSize);
  $: { recherche; page = 0; }
</script>

<div class="tableau">
  <div class="tableau-header">
    <h3>Tableau d'amortissement</h3>
    <div class="controls">
      {#if echeancierRelais.length > 0}
        <label>
          <input type="checkbox" bind:checked={afficherRelais} />
          Afficher relais
        </label>
      {/if}
      <input type="number" placeholder="Mois…" bind:value={recherche} style="width:80px" />
    </div>
  </div>

  {#if afficherRelais && echeancierRelais.length > 0}
    <h4>Période de relais</h4>
    <table>
      <thead>
        <tr>
          <th>Mois</th>
          <th>Mensualité relais</th>
          <th>dont intérêts</th>
        </tr>
      </thead>
      <tbody>
        {#each echeancierRelais as e}
          <tr>
            <td class="center">{e.mois}</td>
            <td>{formatEUR(e.mensualiteRelais)}</td>
            <td>{formatEUR(e.interetRelais)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  <table>
    <thead>
      <tr>
        <th>Mois</th>
        <th>Cap. restant</th>
        <th>Mensualité</th>
        <th>Intérêts</th>
        <th>Capital</th>
        <th>Assurance</th>
        <th>Total</th>
        <th>Remb. anticipé</th>
      </tr>
    </thead>
    <tbody>
      {#each visible as e (e.mois)}
        <tr class:ra={e.remboursementAnticipe > 0}>
          <td class="center">{e.mois}</td>
          <td>{formatEUR(e.capitalRestantDu)}</td>
          <td>{formatEUR(e.mensualiteHorsAssurance)}</td>
          <td class="interet">{formatEUR(e.partInteret)}</td>
          <td class="capital">{formatEUR(e.partCapital)}</td>
          <td>{formatEUR(e.assurance)}</td>
          <td class="bold">{formatEUR(e.mensualiteTotale)}</td>
          <td class="anticipé">
            {e.remboursementAnticipe > 0 ? formatEUR(e.remboursementAnticipe) : '—'}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if pages > 1}
    <div class="pagination">
      <button disabled={page === 0} on:click={() => page--}>← Précédent</button>
      <span>{page + 1} / {pages}</span>
      <button disabled={page >= pages - 1} on:click={() => page++}>Suivant →</button>
    </div>
  {/if}
</div>

<style>
  .tableau {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
  }
  .tableau-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  .controls {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    font-size: 0.82rem;
  }
  h3 {
    margin: 0;
    font-size: 0.85rem;
    color: #1a5276;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  h4 { margin: 0.75rem 0 0.4rem; font-size: 0.82rem; color: #8e44ad; }
  table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
  th {
    background: #1a5276;
    color: white;
    padding: 0.4rem 0.5rem;
    text-align: right;
    white-space: nowrap;
  }
  th:first-child { text-align: center; }
  td {
    padding: 0.3rem 0.5rem;
    border-bottom: 1px solid #f0f0f0;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  td.center { text-align: center; }
  td.interet { color: #c0392b; }
  td.capital { color: #27ae60; }
  td.anticipé { color: #8e44ad; font-weight: 600; }
  td.bold { font-weight: 600; }
  tr.ra { background: #f9f0ff; }
  tr:hover td { background: #f5f9ff; }
  .pagination {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-top: 0.75rem;
  }
  .pagination button {
    padding: 0.3rem 0.8rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    cursor: pointer;
    background: white;
  }
  .pagination button:disabled { opacity: 0.4; cursor: default; }
  input[type="number"] {
    padding: 0.3rem 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.82rem;
  }
</style>
