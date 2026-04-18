# Implementation

## Tech Stack

| Concern | Choice | Version |
|---------|--------|---------|
| UI framework | React | 19 |
| Language | TypeScript | ~6.0 |
| Bundler | Vite | 6 |
| Styling | Tailwind CSS | 3 |
| CSS post-processing | PostCSS + Autoprefixer | — |
| Linting | ESLint + typescript-eslint + eslint-plugin-react-hooks | 9 |
| E2E testing | Playwright | 1.52 |

There are no runtime dependencies beyond React and React DOM. All logic — state management, persistence, i18n — is handled with built-in browser APIs and React hooks.

---

## Project Structure

```
src/
  components/
    Confetti.tsx       — Win celebration animation
    GameDetail.tsx     — In-game screen: sticky header + score table
    GameEditor.tsx     — New game / edit settings form
    GameList.tsx       — Home screen: saved games + settings panel
    ScoreTable.tsx     — Round-by-round score table with input row
  hooks/
    useGames.ts        — All game CRUD and persistence logic
    useHighContrast.ts — High-contrast mode toggle + DOM sync
  i18n/
    index.tsx          — LanguageProvider context + useLanguage hook
    translations.ts    — All string translations for all languages
  types.ts             — Shared TypeScript types (Game, Player)
  App.tsx              — Top-level view router
  index.css            — Tailwind directives, confetti keyframe, HC overrides
  main.tsx             — React root mount

e2e/
  fixtures/            — Page Object Model (POM) fixtures
  requirements/        — Spec files, one per requirement group

docs/
  requirements.md      — Functional and non-functional requirements
  design.md            — Visual design and UX decisions
  implementation.md    — This file

tailwind.config.js     — Custom colour palette and content paths
postcss.config.js      — Autoprefixer integration
vite.config.ts         — Vite + React plugin
tsconfig.app.json      — App TypeScript config (strict, modern target)
```

---

## Application Architecture

### View State Machine

Navigation is managed by a single `view` state in `App.tsx`. There is no router library. The three possible states are:

```typescript
type AppView =
  | { kind: 'list' }
  | { kind: 'setup' }
  | { kind: 'game'; gameId: string };
```

`App` conditionally renders one of three components based on this state. All navigation is handled by passing callbacks (`onBack`, `onNewGame`, `onSelectGame`) down to child components. There is no URL-based routing — the app does not need deep links or browser history integration.

### Data Flow

Data flows strictly downward (props). The `useGames` hook in `App` owns all game state and exposes named mutation functions. Child components receive only what they need and call back via props when a mutation is required.

```
App (useGames, useHighContrast)
  ├── GameList   (games, onNewGame, onSelectGame, onDeleteGame, highContrast, onToggleHighContrast)
  ├── GameEditor (game?, onSave, onCancel)
  └── GameDetail (game, onBack, onAddRound, onDeleteLastRound, onResetGame, onUpdateGame)
        └── ScoreTable (game, onAddRound, onDeleteLastRound)
```

`useHighContrast` is consumed both at the top level (for the toggle button in `GameList`) and independently inside `GameEditor`, `GameDetail`, `ScoreTable`, and `Confetti` for conditional rendering. Since each call reads from `localStorage` on mount and the DOM attribute is updated synchronously, the value is always consistent across components within a single render cycle.

---

## Data Model

```typescript
interface Player {
  id: string;       // Random alphanumeric ID (7 chars, base-36)
  name: string;     // Display name as entered during setup
  scores: number[]; // One entry per round, index 0 = round 1
}

interface Game {
  id: string;          // Random alphanumeric ID
  name: string;        // Game title
  players: Player[];   // Ordered array; order determines column order in table
  mode: 'highest' | 'lowest';
  threshold: number;   // Score at which the game ends
  createdAt: number;   // Unix timestamp (ms); used to sort the game list
}
```

IDs are generated with `Math.random().toString(36).substring(2, 9)`. This is sufficient for a local-only, single-user app where collision probability is negligible.

---

## Persistence

### Storage Key

All games are stored in `localStorage` under the key `score-tracker-games`.

### Versioned Envelope

The stored value is a JSON object:

```json
{ "version": 1, "games": [ ...Game[] ] }
```

The version field enables schema migrations. When the app loads, it reads the stored value and passes it through `applyMigrations`, which upgrades older schemas to the current version before returning the games array. The migrated state is immediately re-saved so subsequent loads are fast.

```
load → parse → detect version → applyMigrations → return games
                                                 → save (if migrated)
```

Legacy plain arrays (version 0, before the envelope was introduced) are detected and wrapped automatically.

### Save Strategy

`useGames` saves the full game array to `localStorage` on every state change via a `useEffect` that depends on `games`. This is a write-on-every-change strategy — simple, correct, and fast enough for the data volumes involved (a few KB at most).

---

## Internationalisation

### Architecture

All translations are plain TypeScript objects in `src/i18n/translations.ts`. Each language key maps to an object implementing the `Translations` interface. Dynamic strings (e.g. player count suffixes) are typed as `(count: number) => string` functions.

A `LanguageProvider` wraps the application root and exposes the active translations and controls via the `useLanguage()` hook:

```typescript
interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;           // Active translation object
  isRTL: boolean;
  availableLanguages: readonly Language[];
  languageNames: Record<Language, string>;
  gender: Gender;
  setGender: (g: Gender) => void;
  isGendered: boolean;       // Whether the active language has gendered forms
}
```

### Language Detection

On load, the provider checks `localStorage` for a stored preference; if absent, it falls back to `navigator.language` (browser locale); if that is also not in the supported set, it defaults to English.

To prevent a flash of the wrong layout direction on reload, the `dir` attribute is applied synchronously at module evaluation time before React renders.

### Gendered Translations

The `femaleTranslations` export in `translations.ts` holds only the keys that differ from the male default. At runtime the provider merges the base translation with the female overrides when both `isGendered` and `gender === 'female'` are true:

```typescript
const t = femaleTrans ? { ...baseTrans, ...femaleTrans } : baseTrans;
```

Adding support for a new gendered language requires: (1) adding it to `GENDERED_LANGUAGES`, (2) adding its overrides to `femaleTranslations`.

---

## High-Contrast Mode

### Mechanism

High-contrast mode is controlled by the `data-hc="true"` attribute on `<html>`. This attribute is set synchronously at module load time (before React) if the stored preference is `"true"`, preventing a flash of non-HC styling.

At runtime, `useHighContrast()` returns `{ highContrast, toggleHighContrast }`. The effect that syncs state → DOM runs after each toggle.

### CSS Layer

All high-contrast overrides are collected in `src/index.css` under `[data-hc="true"]` selectors. They use `!important` to guarantee they supersede Tailwind utility values. The overrides are grouped by concern:

- Background layers (`bg-gray-*`)
- Text colours (`text-gray-*`, `text-indigo-*`, `text-yellow-*`)
- Border colours
- Interactive element backgrounds (buttons)
- Focus rings (`*:focus`)

### Conditional Rendering

Some components conditionally render a text character instead of an SVG icon in HC mode, because SVG icons with subtle stroke styles can be difficult to see even with high contrast colours. Example: the trash icon becomes `×`, the undo icon becomes `− Round`.

---

## Score Table

### State Management

The score table manages a `currentScores` record (`Record<string, string>`) in local state, keyed by player ID. Storing as strings avoids issues with numeric input edge cases (leading zeros, empty string vs. zero).

To handle the case where the player roster or round count changes while the table is mounted (e.g. a player is added via settings), the component uses a synchronous state-during-render update pattern:

```typescript
if (prevPlayerIds !== playerIds || prevRoundCount !== roundCount) {
  setPrevPlayerIds(playerIds);
  setPrevRoundCount(roundCount);
  setCurrentScores(initScores());
}
```

This is the React "derived state from props" pattern and avoids stale input values without introducing an extra render cycle via `useEffect`.

### Leader and Winner Detection

`getLeadersAndWinners` is a pure function computed on every render from the current game state:

- **Highest wins mode:** the player(s) with the maximum total are leaders; if that maximum meets or exceeds the threshold, they become winners instead.
- **Lowest wins mode:** the player(s) with the minimum total are leaders; if any player's total meets or exceeds the threshold, the minimum-total players become winners instead.

Ties are handled — multiple players can share leader or winner status simultaneously.

---

## Build and Tooling

### Build

```bash
npm run build   # tsc -b && vite build
```

TypeScript compilation runs first (strict mode, `noEmit` for type-checking), then Vite bundles and tree-shakes the output into `dist/`.

### Lint

```bash
npm run lint    # eslint .
```

ESLint is configured with `typescript-eslint` (recommended rules) and `eslint-plugin-react-hooks` (enforces rules of hooks and exhaustive deps).

### E2E Tests

```bash
npm run test:e2e   # playwright test
```

Tests live in `e2e/requirements/` and are organised one file per requirement group (game list, game creation, score tracking, etc.). Each spec file carries JSDoc comments mapping tests to their requirement IDs.

Tests use a Page Object Model (POM) via fixture classes in `e2e/fixtures/`:

| Fixture | Responsibility |
|---------|----------------|
| `GameListPage` | Locators and actions for the home screen |
| `GameSetupPage` | Locators and actions for the new-game form |
| `GameDetailPage` | Locators and actions for the score table |
| `GameSettingsPage` | Locators and actions for the in-game settings editor |

Fixtures are composed into `given / when / then` helper objects that make test bodies readable as plain English.

---

## Coding Conventions

### Component Exports

All components are named exports (`export function Foo`). Default exports are used only for the top-level `App` component (Vite convention for the entry component).

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` with `use` prefix
- Other modules: `camelCase.ts`

### Accessibility Attributes

Every interactive element must carry:
- `aria-label` (or `aria-labelledby`) describing its action
- `aria-pressed` for toggle buttons
- `role="switch"` for on/off toggles
- `data-testid` where the E2E tests need a stable selector

### No Magic Strings

All user-facing strings go through `t.*` from `useLanguage()`. All localStorage keys are module-level constants.

### Tailwind Class Ordering

Classes follow the order: layout → sizing → spacing → typography → colour → border → interaction state. This is not enforced by a linter but is the observed convention throughout the codebase.
