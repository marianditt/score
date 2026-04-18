# Design

## Philosophy

The app should feel **effortless, easy, and rewarding**. It is built for people who love games and want to spend their attention on playing — not on operating a tracker. Every design decision is measured against three questions:

1. Does this get out of the way of the game?
2. Would someone pick this up for the first time and know exactly what to do?
3. Does it look like it was made with care?

---

## Target Feel

| Quality | What it means in practice |
|---------|--------------------------|
| **Effortless** | No learning curve. One tap to resume a game, one tap per round to record scores. |
| **Easy** | Actions are labelled, flows are linear, and nothing is hidden behind jargon. |
| **Rewarding** | Winning a game is celebrated. The score table immediately shows who is leading. The UI rewards progress. |

---

## Visual Identity

### Dark Mode Only

The app operates exclusively in dark mode. Board games are often played in the evening, in low-light environments. A dark interface reduces eye strain, looks premium on OLED screens, and keeps the focus on the numbers rather than a bright white background.

There is no light-mode toggle. System preference is not respected — darkness is a deliberate product choice, not an accessibility afterthought.

### Colour Palette

The palette is built around a deep, blue-tinted dark base that feels richer and less flat than neutral grays. Colour is used sparingly and purposefully.

| Role | Value | Usage |
|------|-------|-------|
| Background base | `#08080e` | Page background, fixed bars |
| Surface | `#12121e` | Cards, panels, table header |
| Elevated surface | `#1e1e34` | Inputs, player rows, hover states |
| Border subtle | `#2e2e52` | Card borders, dividers |
| Border strong | `#2e2e52` | Input borders, active states |
| Text primary | `#ffffff` | Headings, game names, totals |
| Text secondary | `#9898c4` | Sub-labels, round numbers, metadata |
| Text muted | `#7070a8` | Hints, placeholders, disabled states |
| Accent (indigo) | `#4f46e5` | Primary buttons, active states, focus rings |
| Accent hover | `#6366f1` | Button hover states |
| Leader highlight | `#818cf8` | Player column headers while leading |
| Winner highlight | `#fde047` | Player column headers when game is won |
| Winner subtle | `rgba(253,224,71,0.15)` | Winner total cell background |
| Danger | `#dc2626` | Delete and reset actions |
| Danger hover | `#ef4444` | Hover state for destructive buttons |

All text colours meet or exceed WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text) against their respective backgrounds. High-contrast mode supersedes these values with strictly verified maximum-contrast pairs.

### Typography

Typography is system-native — no external fonts are loaded. This keeps the app fast and ensures glyphs render correctly for every supported script (Latin, CJK, Devanagari, Arabic, Bengali).

| Context | Style |
|---------|-------|
| App title | `text-3xl font-bold tracking-tight` |
| Screen headings | `text-2xl font-bold` |
| Game names in list | `text-base font-bold` |
| Total scores | `text-2xl font-bold` (winner/leader) or `text-lg font-bold` (normal) |
| Round scores in table | `text-sm` — compact to accommodate many columns |
| Labels and metadata | `text-xs font-semibold uppercase tracking-wider` |
| Body / secondary text | `text-sm` |

### Spacing

The layout follows an 8-point grid. Key values:
- Screen edge padding: `16 px` (mobile), `24–32 px` (tablet+)
- Card padding: `16 px`
- Section gap between cards: `10 px`
- Between label and input: `8 px`

### Border Radius

Rounded corners signal approachability and friendliness — the right tone for a board game app.

| Element | Radius |
|---------|--------|
| Cards and panels | `1 rem` (`rounded-2xl`) |
| Buttons | `0.75 rem` (`rounded-xl`) |
| Inputs | `0.5 rem` (`rounded-lg`) |
| Small chips / badges | `9999 px` (`rounded-full`) |

---

## Layout System

### Mobile-First Containers

All content is constrained to `max-w-2xl` (672 px) centered on screen. On mobile, this fills the full width with `16 px` side padding. On larger screens, the content floats centrally with white space on either side, keeping the narrow score-table layout legible.

### Screen Architecture

The app has three primary screens. Each is a full-page view with no overlapping panels.

```
Game List  →  Game Setup (new/edit)
    ↓
Game Detail (score table)
```

Navigation is linear and reversible. The back arrow always returns to the previous screen.

### Sticky and Fixed Elements

- **Game detail header** — sticky at `top-0`, always shows the game name and controls so the user is never lost after scrolling the score table.
- **Score table action bar** — fixed at `bottom-0`, keeps "Add Round" and "Undo" reachable without scrolling, regardless of how many past rounds exist.
- **Game list "New Game" button** — fixed at `bottom-0` with a gradient fade, so the primary call-to-action is always one tap away.

---

## Component Patterns

### Cards (Game List)

Each saved game is a card with two hit areas separated by a visual divider:

- **Left area (wide):** tap to open the game. Shows name, mode badge, player count, round count, and current leader.
- **Right area (narrow):** tap to begin deletion. Shows a trash icon.

This avoids accidental deletion (the tap targets are clearly separate) while keeping delete accessible without a long-press or swipe gesture.

### Confirmation Dialogs (Inline)

Destructive actions — delete game, reset scores — use an inline confirmation rather than a modal overlay. The card or header transforms in-place to show "Are you sure?" alongside Yes and No buttons. This pattern:
- Is immediately understandable
- Does not block the rest of the UI
- Does not require a dismiss gesture to proceed

### Settings Panel (Collapsible)

Language, high-contrast, and gender preferences live in a collapsible panel triggered by a gear icon in the game list header. The panel appears inline below the header rather than as a modal, keeping the user oriented.

### Score Table

The table prioritises scannability:
- **Total row** — displayed first (top of the table body), with large bold numbers, so the current score state is visible at a glance.
- **Current round row** — displayed immediately below totals, with high-visibility inputs and an indigo background to distinguish it from history rows.
- **History rows** — displayed below the current round, newest first, in a lighter style so they recede visually.

Column headers show the player name plus a status icon (⭐ leader, 🏆 winner) above the name so the icon never truncates with the name.

### Win Condition Toggle

The "Highest wins / Lowest wins" choice is a segmented control (two adjacent buttons, one always active). This pattern is immediately legible — no ambiguity about which is selected.

### Empty State

The empty game list shows a large die emoji, a title, and one line of instruction. It is friendly and direct, never apologetic or over-explained.

---

## Accessibility Design

### High-Contrast Mode

High-contrast mode is a first-class feature, not a CSS afterthought. When enabled:
- Background becomes true black (`#000000`).
- All text becomes pure white (`#ffffff`).
- Accent, leader, and winner colours switch to maximum-contrast equivalents (cyan for accent, gold for winner).
- Every interactive element gains a 2 px solid white border so its bounds are always visible.
- Focus rings expand to 3 px outline in yellow — the most visible colour for users with colour vision deficiency.
- Confetti animation is suppressed to avoid distraction and motion discomfort.

### Focus Management

- Focus rings are always visible (no `outline: none` without a replacement).
- When a confirmation prompt appears (delete, reset), the first action button receives `autoFocus`.
- After adding a player in setup, focus returns to the player name input.
- After submitting a round, focus returns to the first score input.

### ARIA

Every interactive control carries a descriptive `aria-label`. Toggle buttons use `aria-pressed`. Role attributes are applied to all list and table structures. The score-input form is labelled by the game name. Live regions (`aria-live="polite"`) surface hints when the Start button cannot yet be activated.

### Touch Targets

All interactive controls meet the 44 × 44 px minimum touch target size recommended by WCAG 2.5.5. Score inputs on mobile use `inputMode="numeric"` to open the numeric keypad.

---

## Internationalisation Design

### Language Switcher

Languages are shown as chips (pill buttons) in the settings panel, one per language. The active language chip is indigo-filled. This pattern is faster to scan than a dropdown and requires no secondary tap to open.

### Right-to-Left Layout

RTL support uses logical CSS properties throughout (`start`, `end`, `ms-*`, `me-*`) rather than `left`/`right`. The `<html>` element's `dir` attribute is updated to `rtl` when Arabic is active, which instructs the browser and Tailwind to mirror the layout automatically.

The directional back-arrow icon uses `rtl:rotate-180` to flip correctly in RTL.

### Gendered Language

German grammatically distinguishes male and female player-noun forms (*Spieler* vs. *Spielerin*). The gender toggle is shown only when a gendered language is active and allows the user to choose the grammatical gender that matches their group, without implying anything about personal identity. The toggle is hidden for all other languages.

---

## Game-Over Celebration

When a winner is declared, confetti rains down. The animation runs once and does not loop. It is suppressed in high-contrast mode. The winner column is highlighted in gold. These are the only two feedback mechanisms — no sounds, no blocking overlays — keeping the celebration lightweight and the app ready for the next action.
