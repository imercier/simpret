<script lang="ts">
  import {
    scenarios, scenarioActifId, bienCommun,
    ajouterScenario, supprimerScenario, dupliquerScenario, reinitialiser
  } from './lib/stores/simulation';
  import BienCommun from './components/BienCommun.svelte';
  import ScenarioEditor from './components/ScenarioEditor.svelte';
  import ResultatsScenario from './components/ResultatsScenario.svelte';
  import ComparaisonView from './components/ComparaisonView.svelte';

  type Onglet = 'simulation' | 'comparaison';
  let onglet: Onglet = 'simulation';

  let inputFichier: HTMLInputElement;
  let erreurImport = '';

  function exporterSimulation() {
    const data = { bien: $bienCommun, scenarios: $scenarios };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `simpret-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  function importerSimulation(e: Event) {
    erreurImport = '';
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.bien || !Array.isArray(data.scenarios) || data.scenarios.length === 0) {
          erreurImport = 'Fichier invalide.';
          return;
        }
        bienCommun.set(data.bien);
        const migrated = data.scenarios.map((s: any) => {
          const { taeg, ...rest } = s;
          return { pretRelaisDureeEffectiveMois: 3, taux: taeg ?? 3.5, ...rest };
        });
        scenarios.set(migrated);
        scenarioActifId.set(migrated[0].id);
      } catch {
        erreurImport = 'Fichier JSON invalide.';
      }
      inputFichier.value = '';
    };
    reader.readAsText(file);
  }

  $: {
    if ($scenarios.length > 0 && !$scenarios.find(s => s.id === $scenarioActifId)) {
      scenarioActifId.set($scenarios[0].id);
    }
  }

  $: scenarioActif = $scenarios.find(s => s.id === $scenarioActifId);
</script>

<div class="app">
  <header>
    <div class="header-inner">
      <div class="brand">
        <span class="brand-logo">🏠</span>
        <div>
          <h1>SIMPRÊT</h1>
          <p>Simulateur de prêt immobilier</p>
        </div>
      </div>
      <nav>
        <button class:active={onglet === 'simulation'} on:click={() => onglet = 'simulation'}>
          Simulation
        </button>
        <button class:active={onglet === 'comparaison'} on:click={() => onglet = 'comparaison'}>
          Comparaison ({$scenarios.length})
        </button>
        <div class="nav-sep"></div>
        <button class="btn-io" on:click={exporterSimulation} title="Exporter la simulation en JSON">⬇ Exporter</button>
        <button class="btn-io" on:click={() => inputFichier.click()} title="Importer une simulation JSON">⬆ Importer</button>
        <input bind:this={inputFichier} type="file" accept=".json" style="display:none" on:change={importerSimulation} />
        <button class="btn-reset" on:click={reinitialiser} title="Réinitialiser">↺</button>
      </nav>
      {#if erreurImport}
        <p class="erreur-import">{erreurImport}</p>
      {/if}
    </div>
  </header>

  <main>
    {#if onglet === 'simulation'}
      <BienCommun />
      <div class="scenario-bar">
        {#each $scenarios as s}
          <button
            class="tab"
            class:active={s.id === $scenarioActifId}
            on:click={() => scenarioActifId.set(s.id)}
          >
            {s.nom}
            {#if $scenarios.length > 1}
              <span class="tab-x" on:click|stopPropagation={() => supprimerScenario(s.id)}>×</span>
            {/if}
          </button>
        {/each}
        <button class="tab-add" on:click={ajouterScenario}>+ Nouveau</button>
        {#if scenarioActif}
          <button class="tab-dup" on:click={() => dupliquerScenario(scenarioActif!.id)}>Dupliquer</button>
        {/if}
      </div>

      {#if scenarioActif}
        <div class="layout">
          <ScenarioEditor scenario={scenarioActif} />
          <ResultatsScenario scenarioId={scenarioActif.id} />
        </div>
      {/if}

    {:else}
      <ComparaisonView />
    {/if}
  </main>

  <footer>
    <p>Calculs indicatifs — TAEG méthode actuarielle directive MCD · IRA plafonnées art. L313-47 Code conso · TAEA affiché séparément (loi Lagarde)</p>
    <p class="build">build {__BUILD_DATE__} · #{__BUILD_NUMBER__}</p>
  </footer>
</div>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; }
  :global(body) {
    margin: 0;
    padding: 0;
    background: #f0f4f8;
    font-family: system-ui, -apple-system, sans-serif;
    color: #2c3e50;
  }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  header {
    background: #1a5276;
    color: white;
    padding: 0.75rem 1.5rem;
    box-shadow: 0 2px 8px #0002;
  }
  .header-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  .brand { display: flex; align-items: center; gap: 0.75rem; }
  .brand-logo { font-size: 2rem; }
  h1 { margin: 0; font-size: 1.4rem; letter-spacing: 0.05em; }
  .brand p { margin: 0; font-size: 0.75rem; opacity: 0.7; }

  nav { display: flex; gap: 0.5rem; align-items: center; }
  nav button {
    padding: 0.4rem 1rem;
    border: 2px solid rgba(255,255,255,0.5);
    background: transparent;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
  }
  nav button.active { background: white; color: #1a5276; border-color: white; }
  nav button:hover:not(.active) { border-color: white; }
  .btn-reset { padding: 0.4rem 0.7rem; font-size: 1rem; opacity: 0.7; }
  .btn-reset:hover { opacity: 1; }
  .btn-io { font-size: 0.8rem; padding: 0.35rem 0.8rem; opacity: 0.9; }
  .btn-io:hover { opacity: 1; }
  .nav-sep { width: 1px; background: rgba(255,255,255,0.3); align-self: stretch; margin: 0 0.25rem; }
  .erreur-import { color: #e74c3c; font-size: 0.78rem; margin: 0.3rem 0 0; text-align: right; }

  main {
    flex: 1;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 1.25rem 1.5rem;
    box-sizing: border-box;
  }

  .scenario-bar {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 1rem;
  }
  .tab {
    padding: 0.35rem 0.9rem;
    border: 2px solid #2980b9;
    background: white;
    color: #2980b9;
    border-radius: 4px 4px 0 0;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .tab.active { background: #2980b9; color: white; }
  .tab-x { font-size: 1rem; line-height: 1; opacity: 0.6; padding: 0 0.1rem; }
  .tab-x:hover { opacity: 1; }
  .tab-add {
    padding: 0.35rem 0.8rem;
    border: 2px dashed #27ae60;
    color: #27ae60;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
  }
  .tab-add:hover { background: #27ae60; color: white; }
  .tab-dup {
    padding: 0.35rem 0.8rem;
    border: 2px solid #8e44ad;
    color: #8e44ad;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .tab-dup:hover { background: #8e44ad; color: white; }

  .layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 1.5rem;
    align-items: start;
  }
  @media (max-width: 900px) {
    .layout { grid-template-columns: 1fr; }
  }

  footer {
    background: #f0f4f8;
    border-top: 1px solid #dee2e6;
    text-align: center;
    padding: 0.6rem 1rem;
  }
  footer p { margin: 0; font-size: 0.72rem; color: #999; }
  footer p.build { margin-top: 0.2rem; font-size: 0.65rem; color: #bbb; font-variant-numeric: tabular-nums; }
</style>
