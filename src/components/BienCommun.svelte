<script lang="ts">
  import { bienCommun } from '../lib/stores/simulation';
  import { formatEUR } from '../lib/utils/format';

  $: fraisNotaire = $bienCommun.prixBien * ($bienCommun.tauxFraisNotaire / 100);
  $: produitNetVente = Math.max(0, $bienCommun.valeurBienVendu - $bienCommun.resteAPayerPretEnCours);
  $: resteAFinancer = Math.max(0, $bienCommun.prixBien + fraisNotaire - $bienCommun.apportPersonnel - produitNetVente);

  function onNum(field: keyof typeof $bienCommun) {
    return (e: Event) => bienCommun.update(b => ({
      ...b,
      [field]: +(e.currentTarget as HTMLInputElement).value,
    }));
  }
</script>

<div class="bien-commun">
  <span class="label">Bien</span>
  <div class="field">
    <label for="bc-prix">Prix (€)</label>
    <input id="bc-prix" type="number" value={$bienCommun.prixBien} min="0" on:change={onNum('prixBien')} />
  </div>
  <div class="field">
    <label for="bc-apport">Apport (€)</label>
    <input id="bc-apport" type="number" value={$bienCommun.apportPersonnel} min="0" on:change={onNum('apportPersonnel')} />
  </div>
  <div class="field">
    <label for="bc-notaire">Notaire (%)</label>
    <input id="bc-notaire" type="number" value={$bienCommun.tauxFraisNotaire} min="0" max="15" step="0.1" on:change={onNum('tauxFraisNotaire')} />
  </div>
  <div class="sep"></div>
  <div class="field">
    <label for="bc-valeur-vente">Bien en vente (€)</label>
    <input id="bc-valeur-vente" type="number" value={$bienCommun.valeurBienVendu} min="0" on:change={onNum('valeurBienVendu')} />
  </div>
  <div class="field">
    <label for="bc-reste-payer">Reste à payer prêt en cours (€)</label>
    <input id="bc-reste-payer" type="number" value={$bienCommun.resteAPayerPretEnCours} min="0" on:change={onNum('resteAPayerPretEnCours')} />
  </div>
  <div class="sep"></div>
  <div class="field">
    <label for="bc-revenus">Revenus mensuels nets (€)</label>
    <input id="bc-revenus" type="number" value={$bienCommun.revenusMensuels} min="0" on:change={onNum('revenusMensuels')} />
  </div>
  <div class="recap">
    Notaire : <strong>{formatEUR(fraisNotaire)}</strong>
    &nbsp;·&nbsp;
    Reste à financer : <strong>{formatEUR(resteAFinancer)}</strong>
  </div>
</div>

<style>
  .bien-commun {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    background: #1a5276;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  .label {
    color: #f1c40f;
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    align-self: center;
    white-space: nowrap;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  label {
    color: rgba(255,255,255,0.7);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  input {
    padding: 0.35rem 0.6rem;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 4px;
    background: rgba(255,255,255,0.12);
    color: white;
    font-size: 0.9rem;
    width: 140px;
  }
  input:focus {
    outline: none;
    border-color: #f1c40f;
    background: rgba(255,255,255,0.2);
  }
  .recap {
    color: rgba(255,255,255,0.8);
    font-size: 0.8rem;
    align-self: center;
    white-space: nowrap;
  }
  .recap strong { color: white; }
  .sep {
    width: 1px;
    background: rgba(255,255,255,0.25);
    align-self: stretch;
    margin: 0 0.25rem;
  }
</style>
