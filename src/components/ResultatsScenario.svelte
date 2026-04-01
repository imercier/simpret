<script lang="ts">
  import { resultats, bienCommun, scenarios } from '../lib/stores/simulation';
  import RecapCouts from './RecapCouts.svelte';
  import GraphiqueAmortissement from './GraphiqueAmortissement.svelte';
  import TableauAmortissement from './TableauAmortissement.svelte';
  export let scenarioId: string;

  $: res = $resultats.find(r => r.scenarioId === scenarioId);
  $: scenario = $scenarios.find(s => s.id === scenarioId);
  $: revenuEffectif = $bienCommun.revenusMensuels + (scenario?.revenuLocatifMensuel ?? 0) * 0.7;
</script>

{#if res}
  <div class="resultats">
    <RecapCouts {res} revenusMensuels={revenuEffectif} />
    <GraphiqueAmortissement echeancier={res.echeancier} />
    <TableauAmortissement echeancier={res.echeancier} echeancierRelais={res.echeancierRelais} />
  </div>
{/if}

<style>
  .resultats { display: flex; flex-direction: column; gap: 1.25rem; }
</style>
