<script lang="ts">
  import { resultats, bienCommun } from '../lib/stores/simulation';
  import RecapCouts from './RecapCouts.svelte';
  import GraphiqueAmortissement from './GraphiqueAmortissement.svelte';
  import TableauAmortissement from './TableauAmortissement.svelte';
  export let scenarioId: string;

  $: res = $resultats.find(r => r.scenarioId === scenarioId);
</script>

{#if res}
  <div class="resultats">
    <RecapCouts {res} revenusMensuels={$bienCommun.revenusMensuels} />
    <GraphiqueAmortissement echeancier={res.echeancier} />
    <TableauAmortissement echeancier={res.echeancier} echeancierRelais={res.echeancierRelais} />
  </div>
{/if}

<style>
  .resultats { display: flex; flex-direction: column; gap: 1.25rem; }
</style>
