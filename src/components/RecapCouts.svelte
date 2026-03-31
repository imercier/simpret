<script lang="ts">
  import type { ResultatScenario } from '../lib/types';
  import { formatEUR, formatMois } from '../lib/utils/format';

  export let res: ResultatScenario;
  export let revenusMensuels: number;

  $: tauxEndettement = revenusMensuels > 0 ? (res.mensualiteInitiale / revenusMensuels) * 100 : null;
  $: tauxEndettementApres = (revenusMensuels > 0 && res.mensualiteApresRemboursement !== null)
    ? (res.mensualiteApresRemboursement / revenusMensuels) * 100
    : null;
</script>

<div class="recap">
  <div class="kpis">
    <div class="kpi primary">
      <span class="kpi-label">Mensualité</span>
      <span class="kpi-value">{formatEUR(res.mensualiteInitiale)}<small>/mois</small></span>
      {#if res.mensualiteApresRemboursement !== null && res.mensualiteApresRemboursement !== res.mensualiteInitiale}
        <span class="kpi-sub">→ {formatEUR(res.mensualiteApresRemboursement)} après remb. anticipé</span>
      {/if}
    </div>
    <div class="kpi">
      <span class="kpi-label">Durée effective</span>
      <span class="kpi-value">{formatMois(res.dureeTotaleMois)}</span>
    </div>
    <div class="kpi">
      <span class="kpi-label">Capital emprunté</span>
      <span class="kpi-value">{formatEUR(res.montantEmprunte)}</span>
    </div>
{#if res.montantPretRelais > 0}
      <div class="kpi">
        <span class="kpi-label">Montant relais</span>
        <span class="kpi-value">{formatEUR(res.montantPretRelais)}</span>
      </div>
    {/if}
    {#if tauxEndettement !== null}
      <div class="kpi" class:kpi-warn={tauxEndettement > 35} class:kpi-ok={tauxEndettement <= 35}>
        <span class="kpi-label">Taux d'endettement</span>
        <span class="kpi-value">{tauxEndettement.toFixed(1)} %</span>
        {#if tauxEndettementApres !== null && tauxEndettementApres !== tauxEndettement}
          <span class="kpi-sub">→ {tauxEndettementApres.toFixed(1)} % après remb. anticipé</span>
        {/if}
        <span class="kpi-sub">{tauxEndettement > 35 ? '⚠ dépasse 35% (HCSF)' : '≤ 35% (HCSF)'}</span>
      </div>
    {/if}
  </div>

  <div class="cout-block">
    <h3>Coût bancaire total</h3>
    <table>
      <tbody>
        <tr>
          <td>Intérêts</td>
          <td class="montant">{formatEUR(res.couts.coutInterets)}</td>
        </tr>
        <tr>
          <td>Assurance</td>
          <td class="montant">{formatEUR(res.couts.coutAssurance)}</td>
        </tr>
        <tr>
          <td>Frais annexes</td>
          <td class="montant">{formatEUR(res.couts.fraisAnnexes)}</td>
        </tr>
        {#if res.couts.coutPretRelais > 0}
          <tr>
            <td>Prêt relais <small>intérêts + frais</small></td>
            <td class="montant">{formatEUR(res.couts.coutPretRelais + res.couts.fraisAnnexesRelais)}</td>
          </tr>
        {/if}
        <tr class="total">
          <td>Total coût bancaire</td>
          <td class="montant">{formatEUR(res.couts.sousTotal)}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<style>
  .recap { display: flex; flex-direction: column; gap: 1rem; }

  .kpis { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .kpi {
    background: #1a5276;
    color: white;
    border-radius: 8px;
    padding: 0.85rem 1rem;
    min-width: 130px;
    flex: 1;
  }
  .kpi.primary { background: #154360; }
  .kpi.kpi-ok { background: #1e8449; }
  .kpi.kpi-warn { background: #922b21; }
  .kpi-label { font-size: 0.72rem; opacity: 0.75; display: block; }
  .kpi-value {
    font-size: 1.2rem;
    font-weight: 700;
    display: block;
    margin-top: 0.2rem;
    color: #f1c40f;
  }
  .kpi-value small { font-size: 0.7rem; font-weight: 400; opacity: 0.85; color: white; }
  .kpi-sub { font-size: 0.72rem; opacity: 0.85; display: block; margin-top: 0.2rem; }

  .cout-block {
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
  table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  td { padding: 0.4rem 0.5rem; border-bottom: 1px solid #f5f5f5; }
  td.montant { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  small { color: #999; font-size: 0.75rem; }

  tr.total td {
    background: #1a5276;
    color: white;
    font-weight: 700;
    font-size: 0.95rem;
    border-radius: 0;
  }

</style>
