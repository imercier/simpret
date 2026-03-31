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
    <div class="kpi kpi-detail">
      <span class="kpi-label">Capital emprunté</span>
      <span class="kpi-value">{formatEUR(res.montantEmprunte)}</span>
      {#if res.detailMontantEmprunte.estManuel}
        <span class="kpi-sub">Montant saisi manuellement</span>
      {:else}
        <table class="detail-calcul">
          <tbody>
            <tr><td>Prix du bien</td><td>{formatEUR(res.detailMontantEmprunte.prixBien)}</td></tr>
            <tr><td>+ Frais de notaire</td><td>{formatEUR(res.detailMontantEmprunte.fraisNotaire)}</td></tr>
            {#if res.detailMontantEmprunte.fraisAgence > 0}
              <tr><td>+ Frais d'agence</td><td>{formatEUR(res.detailMontantEmprunte.fraisAgence)}</td></tr>
            {/if}
            <tr><td>+ Frais banque</td><td>{formatEUR(res.detailMontantEmprunte.fraisBanque)}</td></tr>
            <tr><td>+ Frais courtier</td><td>{formatEUR(res.detailMontantEmprunte.fraisCourtier)}</td></tr>
            <tr><td>− Apport personnel</td><td>−&nbsp;{formatEUR(res.detailMontantEmprunte.apportPersonnel)}</td></tr>
          </tbody>
          {#if res.detailMontantEmprunte.apportEffectif > 0}
            <tbody>
              <tr><td>− {res.detailMontantEmprunte.labelApportEffectif}</td><td>−&nbsp;{formatEUR(res.detailMontantEmprunte.apportEffectif)}</td></tr>
            </tbody>
          {/if}
          <tbody>
            <tr class="detail-note"><td colspan="2">÷ (1 − {res.detailMontantEmprunte.tauxGarantie}%)</td></tr>
          </tbody>
        </table>
      {/if}
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
      {#if res.montantPretRelais > 0}
        <!-- En-tête 4 colonnes -->
        <thead>
          <tr class="col-header">
            <th></th>
            <th class="montant">Principal</th>
            <th class="montant">Relais</th>
            <th class="montant">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Intérêts</td>
            <td class="montant">{formatEUR(res.couts.coutInterets)}</td>
            <td class="montant">{formatEUR(res.couts.coutPretRelais)}</td>
            <td class="montant col-total">{formatEUR(res.couts.coutInterets + res.couts.coutPretRelais)}</td>
          </tr>
          <tr>
            <td>Assurance <small>{res.detailMontantEmprunte.taea} %</small></td>
            <td class="montant">{formatEUR(res.couts.coutAssurance)}</td>
            <td class="montant">{formatEUR(res.couts.coutAssuranceRelais)}</td>
            <td class="montant col-total">{formatEUR(res.couts.coutAssurance + res.couts.coutAssuranceRelais)}</td>
          </tr>
          <tr>
            <td>Garantie <small>{res.bien.tauxGarantie} %</small></td>
            <td class="montant">{formatEUR(res.couts.coutGarantiePrincipal)}</td>
            <td class="montant">{formatEUR(res.couts.coutGarantieRelais)}</td>
            <td class="montant col-total">{formatEUR(res.couts.coutGarantie)}</td>
          </tr>
          {#if res.couts.ira > 0 && res.iraDetail}
            <tr>
              <td>
                IRA <small>art. L313-47</small>
                <div class="ira-detail">
                  3 % du capital : {formatEUR(res.iraDetail.plafond3pct)}{res.iraDetail.plafond3pct <= res.iraDetail.plafond6mois ? ' ✓ retenu' : ''}<br>
                  6 mois d'intérêts : {formatEUR(res.iraDetail.plafond6mois)}{res.iraDetail.plafond6mois < res.iraDetail.plafond3pct ? ' ✓ retenu' : ''}
                </div>
              </td>
              <td class="montant">{formatEUR(res.couts.ira)}</td>
              <td class="montant col-vide">—</td>
              <td class="montant col-total">{formatEUR(res.couts.ira)}</td>
            </tr>
          {/if}
          <tr class="sous-total">
            <td>Sous-total</td>
            <td class="montant">{formatEUR(res.couts.sousTotalPrincipal)}</td>
            <td class="montant">{formatEUR(res.couts.sousTotalRelais)}</td>
            <td class="montant col-total">{formatEUR(res.couts.sousTotalPrincipal + res.couts.sousTotalRelais)}</td>
          </tr>
          <tr class="section-header">
            <td colspan="4">Frais communs</td>
          </tr>
          <tr>
            <td>Frais de banque</td>
            <td class="montant col-vide" colspan="2">—</td>
            <td class="montant col-total">{formatEUR(res.couts.fraisBanque)}</td>
          </tr>
          <tr>
            <td>Frais courtier</td>
            <td class="montant col-vide" colspan="2">—</td>
            <td class="montant col-total">{formatEUR(res.couts.fraisCourtier)}</td>
          </tr>
          <tr class="total">
            <td>Total coût bancaire</td>
            <td class="montant col-vide"></td>
            <td class="montant col-vide"></td>
            <td class="montant">{formatEUR(res.couts.sousTotal)}</td>
          </tr>
        </tbody>
      {:else}
        <!-- Sans relais : tableau 2 colonnes classique -->
        <tbody>
          <tr>
            <td>Intérêts</td>
            <td class="montant">{formatEUR(res.couts.coutInterets)}</td>
          </tr>
          <tr>
            <td>Assurance <small>{res.detailMontantEmprunte.taea} %</small></td>
            <td class="montant">{formatEUR(res.couts.coutAssurance)}</td>
          </tr>
          <tr>
            <td>
              Garantie <small>{res.bien.tauxGarantie} %</small>
              <div class="ira-detail">
                {formatEUR(res.detailMontantEmprunte.assieteGarantiePrincipal)} × {res.bien.tauxGarantie} %
              </div>
            </td>
            <td class="montant">{formatEUR(res.couts.coutGarantiePrincipal)}</td>
          </tr>
          <tr>
            <td>Frais de banque</td>
            <td class="montant">{formatEUR(res.couts.fraisBanque)}</td>
          </tr>
          <tr>
            <td>Frais courtier</td>
            <td class="montant">{formatEUR(res.couts.fraisCourtier)}</td>
          </tr>
          {#if res.couts.ira > 0 && res.iraDetail}
            <tr>
              <td>
                IRA <small>art. L313-47</small>
                <div class="ira-detail">
                  3 % du capital : {formatEUR(res.iraDetail.plafond3pct)}{res.iraDetail.plafond3pct <= res.iraDetail.plafond6mois ? ' ✓ retenu' : ''}<br>
                  6 mois d'intérêts : {formatEUR(res.iraDetail.plafond6mois)}{res.iraDetail.plafond6mois < res.iraDetail.plafond3pct ? ' ✓ retenu' : ''}
                </div>
              </td>
              <td class="montant">{formatEUR(res.couts.ira)}</td>
            </tr>
          {/if}
          <tr class="total">
            <td>Total coût bancaire</td>
            <td class="montant">{formatEUR(res.couts.sousTotal)}</td>
          </tr>
        </tbody>
      {/if}
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

  .kpi-detail { min-width: 200px; }
  .detail-calcul { width: 100%; border-collapse: collapse; margin-top: 0.4rem; font-size: 0.68rem; opacity: 0.85; }
  .detail-calcul td { padding: 0.1rem 0; }
  .detail-calcul td:last-child { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .detail-note td { opacity: 0.65; font-style: italic; padding-top: 0.2rem; }

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
  .ira-detail { font-size: 0.72rem; color: #888; margin-top: 0.25rem; line-height: 1.5; }

  tr.col-header th {
    font-size: 0.75rem;
    font-weight: 700;
    color: #1a5276;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-bottom: 0.3rem;
    border-bottom: 2px solid #1a5276;
  }
  td.col-vide { color: #ccc; }
  td.col-total { font-weight: 600; border-left: 1px solid #dee2e6; background: #f5f8fc; }
  tr.section-header td {
    background: #eaf0f8;
    color: #1a5276;
    font-weight: 700;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-top: 0.5rem;
  }
  tr.sous-total td {
    font-weight: 600;
    border-top: 1px solid #dee2e6;
    background: #f5f8fc;
  }
  tr.total td {
    background: #1a5276;
    color: white;
    font-weight: 700;
    font-size: 0.95rem;
    border-radius: 0;
  }

</style>
