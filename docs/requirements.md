# Requirements

## Purpose

Score is a mobile-first progressive web app for tracking scores in board games. It targets board game power users who want to start a session quickly and record rounds without friction — at the kitchen table, no pen and paper required.

---

## Audience

- **Primary:** Board game enthusiasts who play regularly and want a fast, reliable score tracker on their phone.
- **Secondary:** Casual players who join a session and need the app to be immediately understandable with no onboarding.
- The app must be welcoming to everyone regardless of gender, language, or ability. Many gamers are women, and the design and language must never assume otherwise.

---

## Functional Requirements

Requirements are numbered and correspond to the identifiers used in the end-to-end test suite (`e2e/requirements/`).

### Game List

| # | Requirement |
|---|-------------|
| REQ-1 | The app shows a game list when opened. |
| REQ-2 | The game list has a "New Game" button. |
| REQ-3 | When no games have been created, an empty-state message is shown. |
| REQ-4 | Each game in the list displays its name, win-condition mode, round count, and current leader. |
| REQ-20 | A game can be deleted from the list after the user confirms a prompt. |
| REQ-21 | Deletion can be cancelled; the game remains in the list. |

### Game Creation

| # | Requirement |
|---|-------------|
| REQ-5 | Clicking "New Game" opens the game-setup form. |
| REQ-6 | A game requires a name — the Start button is disabled until one is entered. |
| REQ-7 | A game requires at least one player — the Start button is disabled without one. |
| REQ-8 | Players can be added by name (via button click or the Enter key). |
| REQ-9 | Players can be removed individually during setup. |
| REQ-10 | Players can be reordered (move up / move down) during setup. |
| REQ-11 | The win condition can be set to "highest wins" (default). |
| REQ-12 | The win condition can be set to "lowest wins". |
| REQ-13 | A target score threshold can be configured. |
| REQ-14 | Completing valid setup starts the game and navigates to the game detail view. |
| REQ-22 | Cancelling setup navigates back to the game list. |
| REQ-23 | The back arrow in setup navigates back to the game list. |
| REQ-31 | The threshold field is empty on load (placeholder shows 100). A value greater than zero is required before the Start button enables. |

### Score Tracking

| # | Requirement |
|---|-------------|
| REQ-15 | The game detail view shows the game name, all player columns, and a score table. |
| REQ-16 | Round scores can be entered and saved; saved rounds appear in the table. |
| REQ-17 | Running totals update correctly after each round is saved. |
| REQ-18 | In "highest wins" mode, the player with the highest running total is highlighted as the current leader (⭐). |
| REQ-18b | In "lowest wins" mode, the player with the lowest running total is highlighted as the current leader (⭐). |
| REQ-19 | In "highest wins" mode, a winner (🏆) is declared when any player's total reaches or exceeds the threshold. |
| REQ-19b | In "lowest wins" mode, a winner (🏆) is declared when any player's total reaches or exceeds the threshold; the player with the lowest total at that point wins. |
| REQ-24 | The last round can be undone; the row disappears and totals revert. |
| REQ-25 | All scores can be reset to zero after the user confirms a prompt. |
| REQ-26 | Cancelling a reset leaves scores unchanged. |
| REQ-27 | Navigating back from the game detail returns the user to the game list. |
| REQ-32 | The score table is mobile-friendly: up to six players fit on a 375 px wide viewport without horizontal page scrolling. |

### Game Settings (Editing a Live Game)

| # | Requirement |
|---|-------------|
| REQ-36 | From the game detail, the user can open a settings editor to change the game name, add or remove players, change the win-condition mode, and change the threshold. |
| REQ-37 | Existing player scores are preserved when the game settings are saved. |
| REQ-38 | New players added through settings start with zero scores. |

### Persistence

| # | Requirement |
|---|-------------|
| REQ-28 | Games persist across page reloads (stored in `localStorage`). |
| REQ-29 | Round scores persist across page reloads. |
| REQ-30 | A deleted game does not reappear after a reload. |

### Internationalisation

| # | Requirement |
|---|-------------|
| REQ-33 | The user can change the interface language from the game list screen. |
| REQ-33b | The UI switches to the selected language immediately. |
| REQ-33c | The selected language persists across page reloads. |
| REQ-33d | Selecting Arabic switches the page direction to right-to-left. |

### Accessibility

| # | Requirement |
|---|-------------|
| REQ-34 | A high-contrast mode can be toggled from the game list screen. |
| REQ-34b | Enabling high contrast sets `data-hc="true"` on the `<html>` element. |
| REQ-34c | Disabling high contrast removes the attribute. |
| REQ-34d | The high-contrast preference persists across page reloads. |

### Gender-Inclusive Language

| # | Requirement |
|---|-------------|
| REQ-35 | For languages that grammatically distinguish gendered forms (currently German), a gender toggle appears next to the language selector. |
| REQ-35a | The gender toggle is visible when German is the active language. |
| REQ-35b | The gender toggle is hidden for languages without gendered forms (e.g. English). |
| REQ-35c | Selecting the female form switches player-related strings to their female variants (e.g. *Spielerin*). |
| REQ-35d | Toggling back to the male form reverts to male variants. |
| REQ-35e | The gender preference persists across page reloads. |
| REQ-35f | Switching from a gendered language to a non-gendered language hides the toggle. |

---

## Non-Functional Requirements

### Dark Mode
The app is dark-mode only. There is no light-mode variant. The background, surfaces, typography, and all interactive elements are designed exclusively for dark environments.

### Mobile-First
The primary target device is a smartphone held in portrait orientation. All layouts, touch targets, and typography are sized for mobile first and scale gracefully to larger screens.

### Performance
- The app must load and be interactive immediately (no server round-trips; all data is local).
- Round submission must feel instant.

### Accessibility
- All interactive elements must be keyboard-navigable.
- Focus indicators must always be visible.
- Screen-reader labels (`aria-label`, `role`, `aria-pressed`, etc.) are required on all controls.
- High-contrast mode must produce sufficient contrast for users with low vision, without relying on colour alone to convey information.
- Animations (confetti) must be suppressed in high-contrast mode.

### Internationalisation
- The app must support at least nine languages: English, German, Simplified Chinese, Hindi, Spanish, French, Arabic, Bengali, and Portuguese.
- All translatable strings must live in the central translation file; no hardcoded UI text is permitted outside it.
- Right-to-left layout must be applied automatically when Arabic is active.
- The gender-toggle mechanism must be extensible to other languages in the future.

### Consistency & Quality
- Zero tolerance for broken layouts at any supported viewport width.
- Zero tolerance for hardcoded colours or spacing outside the design system.
- All confirmation-destructive actions (delete, reset) require a two-step confirmation before taking effect.
