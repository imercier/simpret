# SIMPRÊT — Simulateur de Prêt Immobilier

Application web de simulation de prêt immobilier, entièrement côté client (aucun serveur, aucune donnée transmise). Permet de modéliser, comparer et exporter des scénarios de financement immobilier avec une grande finesse : prêt principal, prêt relais, remboursement anticipé, TAEG, TAEA, IRA.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework UI | [Svelte 5](https://svelte.dev/) |
| Langage | TypeScript 5.9 |
| Bundler | Vite 8 |
| Graphiques | Chart.js 4 |
| Persistence | `localStorage` (navigateur) |

Aucun backend, aucune base de données, aucune dépendance réseau au runtime.

---

## Structure du projet

```
app/
├── src/
│   ├── App.svelte                   # Point d'entrée : layout, navigation, import/export JSON
│   ├── main.ts                      # Bootstrap Svelte
│   ├── app.css                      # Styles globaux
│   ├── components/
│   │   ├── BienCommun.svelte        # Formulaire des paramètres du bien (prix, apport, notaire…)
│   │   ├── ScenarioEditor.svelte    # Formulaire d'un scénario (taux, durée, relais, IRA…)
│   │   ├── ResultatsScenario.svelte # Affichage des résultats d'un scénario
│   │   ├── RecapCouts.svelte        # Récapitulatif des coûts globaux
│   │   ├── TableauAmortissement.svelte # Tableau d'amortissement mensuel
│   │   ├── GraphiqueAmortissement.svelte # Graphique Chart.js capital/intérêts
│   │   ├── ComparaisonView.svelte   # Vue de comparaison multi-scénarios
│   │   └── ExportActions.svelte     # Bouton export CSV
│   └── lib/
│       ├── types/index.ts           # Interfaces TypeScript (BienCommun, ScenarioParams, ResultatScenario…)
│       ├── stores/simulation.ts     # Stores Svelte (état global) + persistence localStorage
│       ├── calculs/
│       │   ├── index.ts             # Orchestrateur : calculerScenario(), creerScenarioDefaut()
│       │   ├── amortissement.ts     # Échéancier amortissement constant et in-fine
│       │   ├── pretRelais.ts        # Calcul et échéancier du prêt relais
│       │   ├── remboursementAnticipe.ts # Application d'un remboursement anticipé (IRA)
│       │   └── taeg.ts              # Vérification TAEG par méthode actuarielle (Newton-Raphson)
│       └── utils/format.ts          # Formatage monétaire / pourcentage
├── public/                          # Assets statiques (favicon, icônes SVG)
├── dist/                            # Build de production (généré par `vite build`)
├── vite.config.ts
├── svelte.config.js
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── package.json
```

---

## Modèle de données

### `BienCommun` — Paramètres du bien (partagés entre tous les scénarios)

| Champ | Type | Description |
|---|---|---|
| `prixBien` | `number` | Prix d'achat du bien en € |
| `apportPersonnel` | `number` | Apport personnel en € |
| `tauxFraisNotaire` | `number` | Taux frais de notaire (ex: `7.5` pour 7,5 %) |
| `valeurBienVendu` | `number` | Valeur estimée du bien à vendre (pour prêt relais) |
| `resteAPayerPretEnCours` | `number` | Capital restant dû sur le prêt du bien à vendre |
| `revenusMensuels` | `number` | Revenus mensuels nets (pour calcul taux d'endettement) |

### `ScenarioParams` — Paramètres d'un scénario de financement

**Prêt principal**

| Champ | Description |
|---|---|
| `montantEmprunte` | Montant en € (0 = auto-calculé depuis les paramètres du bien) |
| `dureeAns` | Durée en années |
| `taeg` | Taux annuel effectif global en % |
| `taea` | Taux annuel effectif assurance en % |
| `typeAmortissement` | `'constant'` ou `'in-fine'` |
| `fraisAnnexes` | Frais de dossier, garantie, courtier en € |

**Prêt relais**

| Champ | Description |
|---|---|
| `pretRelaisActif` | Activation du prêt relais |
| `pretRelaisQuotite` | Quotité en % (ex: `70` → montant = valeurBien × 70 %) |
| `pretRelaisDureeMois` | Durée du relais en mois |
| `pretRelaisTaux` | Taux annuel du relais en % |
| `pretRelaisType` | `'franchise-totale'` ou `'franchise-partielle'` |
| `pretRelaisfraisAnnexes` | Frais annexes du relais en € |

**Remboursement anticipé**

| Champ | Description |
|---|---|
| `remboursementAnticipeActif` | Activation |
| `remboursementAnticipeMois` | Mois du remboursement (à partir du mois 1) |
| `remboursementAnticipeMontant` | Montant remboursé en € |
| `remboursementAnticipeConsequence` | `'reduire-duree'` ou `'reduire-mensualite'` |
| `iraActif` | Appliquer les Indemnités de Remboursement Anticipé |

### `ResultatScenario` — Résultat calculé (dérivé, non persisté)

Contient : mensualité initiale, mensualité après remboursement anticipé, durée totale, montant emprunté, coûts globaux (`CoutsGlobaux`), échéancier d'amortissement (`EcheanceAmortissement[]`), échéancier relais (`EcheanceRelais[]`).

---

## Moteur de calcul

Tous les calculs sont purement fonctionnels, en TypeScript, sans effets de bord.

### Flux de calcul (`calculerScenario`)

1. **Frais de notaire** = `prixBien × tauxFraisNotaire / 100`
2. **Prêt relais** : montant = `valeurBien × quotite / 100`, puis construction de l'échéancier relais (franchise totale : intérêts capitalisés ; franchise partielle : intérêts payés mensuellement)
3. **Montant principal auto** = `prixBien + fraisNotaire + fraisAnnexes − apportPersonnel − apportEffectif`
4. **Échéancier principal** : amortissement constant (formule des rentes) ou in-fine
5. **Remboursement anticipé** : application à un mois donné, recalcul de la mensualité ou de la durée restante, calcul des IRA (plafonnées à 3 % du capital restant ou 6 mois d'intérêts, art. L313-47 Code conso)
6. **Coûts globaux** : agrégation de tous les postes (intérêts, assurance, frais, relais, notaire)

### TAEG — Vérification actuarielle

`taeg.ts` implémente la méthode Newton-Raphson pour calculer le taux mensuel `i` tel que la valeur actuelle nette de tous les flux soit nulle, puis annualise : `TAEG = i × 12 × 100`.

---

## État global et persistence

L'état est géré par des **stores Svelte** (`writable` / `derived`) dans `src/lib/stores/simulation.ts` :

- `bienCommun` — paramètres du bien, auto-sauvegardés dans `localStorage` (clé `simpret-bien`)
- `scenarios` — liste des scénarios, auto-sauvegardés dans `localStorage` (clé `simpret-scenarios`)
- `scenarioActifId` — ID du scénario affiché (non persisté)
- `resultats` — store dérivé, recalculé automatiquement à chaque changement

À l'ouverture, l'app recharge l'état depuis `localStorage`. Si absent, les valeurs par défaut sont appliquées (bien à 927 000 €, apport 330 000 €, taux 7 %, scénario à 3,5 % sur 12 ans).

---

## Fonctionnalités

- **Multi-scénarios** : créer, dupliquer, supprimer, renommer des scénarios en onglets
- **Vue comparaison** : tableau de synthèse côte-à-côte de tous les scénarios (mensualité, durée, capital, intérêts, assurance, frais annexes, relais → **sous-total crédit**)
- **Export JSON** : sauvegarder la simulation complète (bien + scénarios) dans un fichier `.json`
- **Import JSON** : recharger une simulation précédemment exportée
- **Graphique** : courbe d'amortissement (capital restant, intérêts cumulés) via Chart.js
- **Réinitialisation** : bouton ↺ pour revenir aux valeurs par défaut

---

## Commandes

```bash
# Installer les dépendances
npm install

# Démarrer en développement (Hot Module Replacement)
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview

# Vérification TypeScript + Svelte
npm run check
```

---

## Conformité réglementaire

Les calculs sont conformes aux règles françaises suivantes (affichées dans le pied de page) :

- **TAEG** : méthode actuarielle directive MCD (Mortgage Credit Directive)
- **IRA** : plafonnées selon l'art. L313-47 du Code de la consommation (3 % du capital restant dû ou 6 mois d'intérêts, le moins élevé des deux)
- **TAEA** : affiché séparément conformément à la loi Lagarde


---

## Contexte pour LLM

Ce projet est une **SPA (Single Page Application) Svelte 5 + TypeScript + Vite**, entièrement frontend, sans API ni serveur.

**Points clés pour comprendre le code :**
- L'état applicatif réside dans `src/lib/stores/simulation.ts` — c'est le point d'entrée pour comprendre le flux de données
- Tous les calculs financiers sont dans `src/lib/calculs/` — purs, testables indépendamment
- Les types centraux sont dans `src/lib/types/index.ts` — lire en premier pour comprendre le modèle
- Les composants Svelte consomment les stores directement via la syntaxe `$store`
- Le calcul est entièrement réactif : modifier `bienCommun` ou `scenarios` recalcule `resultats` automatiquement via `derived`
- Aucune route, aucun router : navigation par état local (`onglet: 'simulation' | 'comparaison'`)
