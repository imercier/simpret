import { writable, derived } from 'svelte/store';
import type { ScenarioParams, ResultatScenario, BienCommun } from '../types';
import { calculerScenario, creerScenarioDefaut } from '../calculs';

function loadBien(): BienCommun {
  try {
    const saved = localStorage.getItem('simpret-bien');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { prixBien: 927000, apportPersonnel: 330000, tauxFraisNotaire: 7, valeurBienVendu: 500000, resteAPayerPretEnCours: 0, revenusMensuels: 0 };
}

function loadScenarios(): ScenarioParams[] {
  try {
    const saved = localStorage.getItem('simpret-scenarios');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [creerScenarioDefaut()];
}

export const bienCommun = writable<BienCommun>(loadBien());
export const scenarios = writable<ScenarioParams[]>(loadScenarios());
export const scenarioActifId = writable<string>('');

bienCommun.subscribe(val => {
  try { localStorage.setItem('simpret-bien', JSON.stringify(val)); } catch {}
});

scenarios.subscribe(val => {
  try { localStorage.setItem('simpret-scenarios', JSON.stringify(val)); } catch {}
});

export const resultats = derived<[typeof bienCommun, typeof scenarios], ResultatScenario[]>(
  [bienCommun, scenarios],
  ([$bien, $scenarios]) => $scenarios.map(s => calculerScenario(s, $bien))
);

export function ajouterScenario() {
  scenarios.update(list => {
    const nouveau: ScenarioParams = {
      ...creerScenarioDefaut(),
      id: crypto.randomUUID(),
      nom: `Scénario ${list.length + 1}`,
    };
    scenarioActifId.set(nouveau.id);
    return [...list, nouveau];
  });
}

export function supprimerScenario(id: string) {
  scenarios.update(list => {
    if (list.length <= 1) return list;
    const next = list.filter(s => s.id !== id);
    scenarioActifId.set(next[0].id);
    return next;
  });
}

export function dupliquerScenario(id: string) {
  scenarios.update(list => {
    const src = list.find(s => s.id === id);
    if (!src) return list;
    const copie: ScenarioParams = { ...src, id: crypto.randomUUID(), nom: src.nom + ' (copie)' };
    scenarioActifId.set(copie.id);
    return [...list, copie];
  });
}

export function mettreAJourScenario(id: string, champs: Partial<ScenarioParams>) {
  scenarios.update(list => list.map(s => s.id === id ? { ...s, ...champs } : s));
}

export function reinitialiser() {
  bienCommun.set({ prixBien: 927000, apportPersonnel: 330000, tauxFraisNotaire: 7, valeurBienVendu: 500000, resteAPayerPretEnCours: 0, revenusMensuels: 0 });
  const def = creerScenarioDefaut();
  scenarios.set([def]);
  scenarioActifId.set(def.id);
}
