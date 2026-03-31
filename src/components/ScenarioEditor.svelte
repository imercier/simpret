<script lang="ts">
  import type { ScenarioParams } from '../lib/types';
  import { mettreAJourScenario, resultats } from '../lib/stores/simulation';
  import { formatEUR } from '../lib/utils/format';

  export let scenario: ScenarioParams;

  import { bienCommun } from '../lib/stores/simulation';

  $: res = $resultats.find(r => r.scenarioId === scenario.id);
  $: montantRelais = scenario.pretRelaisActif
    ? $bienCommun.valeurBienVendu * (scenario.pretRelaisQuotite / 100)
    : 0;

  function upd(champs: Partial<ScenarioParams>) {
    mettreAJourScenario(scenario.id, champs);
  }

  // Handlers typés pour éviter le conflit value+store
  function onText(field: keyof ScenarioParams) {
    return (e: Event) => upd({ [field]: (e.currentTarget as HTMLInputElement).value } as any);
  }
  function onNum(field: keyof ScenarioParams) {
    return (e: Event) => upd({ [field]: +(e.currentTarget as HTMLInputElement).value } as any);
  }
  function onCheck(field: keyof ScenarioParams) {
    return (e: Event) => upd({ [field]: (e.currentTarget as HTMLInputElement).checked } as any);
  }
  function onSelect(field: keyof ScenarioParams) {
    return (e: Event) => upd({ [field]: (e.currentTarget as HTMLSelectElement).value } as any);
  }
</script>

<aside class="editor">
  <div class="field">
    <label>Nom du scénario</label>
    <input type="text" value={scenario.nom} on:change={onText('nom')} />
  </div>

  <!-- Prêt principal -->
  <section>
    <h3>Prêt principal</h3>
    <div class="field">
      <label>Montant emprunté (€) {#if scenario.montantEmprunte > 0}<small>0 = auto</small>{/if}</label>
      <input type="number" value={scenario.montantEmprunte === 0 && res ? res.montantEmprunte : scenario.montantEmprunte} min="0" on:change={onNum('montantEmprunte')} />
    </div>
    <div class="field">
      <label>Durée (années)</label>
      <input type="number" value={scenario.dureeAns} min="1" max="30" on:change={onNum('dureeAns')} />
    </div>
    <div class="field">
      <label>Taux nominal (%)</label>
      <input type="number" value={scenario.taux} min="0" max="20" step="0.01" on:change={onNum('taux')} />
    </div>
    <div class="field">
      <label>Mode assurance</label>
      <select value={scenario.typeAssurance} on:change={onSelect('typeAssurance')}>
        <option value="capital-initial">Capital initial (groupe bancaire)</option>
        <option value="capital-restant">Capital restant dû (délégation)</option>
      </select>
    </div>
  </section>

  <!-- Prêt relais -->
  <section>
    <h3>
      <label class="toggle">
        <input type="checkbox" checked={scenario.pretRelaisActif} on:change={onCheck('pretRelaisActif')} />
        Prêt relais
      </label>
    </h3>
    {#if scenario.pretRelaisActif}
      <div class="field readonly">
        <label>Valeur du bien vendu (€)</label>
        <span class="val-commune">{formatEUR($bienCommun.valeurBienVendu)}</span>
      </div>
      <div class="field">
        <label>Quotité accordée (%)</label>
        <input type="number" value={scenario.pretRelaisQuotite} min="0" max="100" step="5" on:change={onNum('pretRelaisQuotite')} />
        <span class="hint">→ Montant relais : {formatEUR(montantRelais)}</span>
      </div>
      <div class="field">
        <label>Durée contractuelle max (mois)</label>
        <input type="number" value={scenario.pretRelaisDureeMois} min="1" max="24" on:change={onNum('pretRelaisDureeMois')} />
      </div>
      <div class="field">
        <label>Durée effective (mois) <small>vente réelle du bien</small></label>
        <input type="number" value={scenario.pretRelaisDureeEffectiveMois} min="1" max={scenario.pretRelaisDureeMois} on:change={onNum('pretRelaisDureeEffectiveMois')} />
        <span class="hint">Coût calculé sur {Math.min(scenario.pretRelaisDureeEffectiveMois, scenario.pretRelaisDureeMois)} mois</span>
      </div>
      <div class="field">
        <label>Taux du relais (%)</label>
        <input type="number" value={scenario.pretRelaisTaux} min="0" max="20" step="0.01" on:change={onNum('pretRelaisTaux')} />
      </div>
      <div class="field">
        <label>Type de franchise</label>
        <select value={scenario.pretRelaisType} on:change={onSelect('pretRelaisType')}>
          <option value="franchise-partielle">Franchise partielle (intérêts mensuels)</option>
          <option value="franchise-totale">Franchise totale (intérêts capitalisés)</option>
        </select>
      </div>
    {/if}
  </section>

  <!-- Remboursement anticipé -->
  <section>
    <h3>
      <label class="toggle">
        <input type="checkbox" checked={scenario.remboursementAnticipeActif} on:change={onCheck('remboursementAnticipeActif')} />
        Remboursement anticipé
      </label>
    </h3>
    {#if scenario.remboursementAnticipeActif}
      <div class="field">
        <label>Au mois numéro</label>
        <input type="number" value={scenario.remboursementAnticipeMois} min="1" on:change={onNum('remboursementAnticipeMois')} />
      </div>
      <div class="field">
        <label>Montant (€)</label>
        <input type="number" value={scenario.remboursementAnticipeMontant} min="0" on:change={onNum('remboursementAnticipeMontant')} />
      </div>
      <div class="field">
        <label>Conséquence</label>
        <select value={scenario.remboursementAnticipeConsequence} on:change={onSelect('remboursementAnticipeConsequence')}>
          <option value="reduire-duree">Réduire la durée</option>
          <option value="reduire-mensualite">Réduire la mensualité</option>
        </select>
      </div>
      <div class="field">
        <label class="toggle">
          <input type="checkbox" checked={scenario.iraActif} on:change={onCheck('iraActif')} />
          Appliquer les IRA (pénalités légales, art. L313-47)
        </label>
      </div>
    {/if}
  </section>
</aside>

<style>
  .editor {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.25rem;
    border: 1px solid #dee2e6;
  }
  section {
    margin-top: 1.25rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
  }
  h3 {
    margin: 0 0 0.75rem;
    font-size: 0.85rem;
    color: #1a5276;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .field { margin-bottom: 0.65rem; }
  label { display: block; font-size: 0.82rem; color: #555; margin-bottom: 0.2rem; }
  small { color: #999; font-size: 0.75rem; }
  input[type="number"],
  input[type="text"],
  select {
    width: 100%;
    padding: 0.4rem 0.6rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.88rem;
    box-sizing: border-box;
    background: white;
  }
  input:focus, select:focus {
    outline: none;
    border-color: #2980b9;
    box-shadow: 0 0 0 2px #2980b930;
  }
  .val-commune {
    display: block;
    padding: 0.4rem 0.6rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.88rem;
    background: #f0f4f8;
    color: #555;
    font-weight: 600;
  }
  .hint {
    font-size: 0.76rem;
    color: #27ae60;
    font-weight: 600;
    margin-top: 0.15rem;
    display: block;
  }
  .toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    color: #1a5276;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .toggle input { width: auto; margin: 0; }
</style>
