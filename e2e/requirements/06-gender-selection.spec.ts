import { test, expect } from '../fixtures/index';

/**
 * REQ-35 A gender toggle button appears to the right of the language selector
 *        (in LTR layout) for languages that differentiate gendered word forms.
 *
 * REQ-35a The gender toggle is visible when a gendered language (German) is selected.
 * REQ-35b The gender toggle is hidden for languages without gender distinction (English).
 * REQ-35c When female is selected in German, player counts use the female form (Spielerin).
 * REQ-35d Toggling back to male reverts player counts to the male form (Spieler).
 * REQ-35e The gender preference persists across page reloads.
 * REQ-35f Switching from a gendered language to a non-gendered language hides the toggle.
 */

test.describe('Gender Selection', () => {
  // ─── REQ-35a/b: Visibility ─────────────────────────────────────────────────

  test('REQ-35a — given German is selected, then the gender toggle is visible', async ({
    given,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    await gameList.selectLanguage('de');

    await then.theGenderToggleIsVisible(gameList);
  });

  test('REQ-35b — given English is selected, then the gender toggle is hidden', async ({
    given,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    // English is the default — no language switch needed

    await then.theGenderToggleIsHidden(gameList);
  });

  // ─── REQ-35c/d: Text changes ───────────────────────────────────────────────

  test('REQ-35c — given German and a game with 1 player, when female is selected, the player count shows the female form', async ({
    given,
    when,
    page,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice'],
      threshold: 100,
    });
    const gameList = await when.theUserNavigatesBackToTheGameList(detail);
    await gameList.selectLanguage('de');

    // Male default: "1 Spieler"
    await expect(page.getByText('1 Spieler', { exact: true })).toBeVisible();

    // Switch to female
    await gameList.selectGender('female');

    // Female form: "1 Spielerin"
    await expect(page.getByText('1 Spielerin', { exact: true })).toBeVisible();
  });

  test('REQ-35d — given female gender is active, toggling back to male reverts to male form', async ({
    given,
    when,
    page,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice'],
      threshold: 100,
    });
    const gameList = await when.theUserNavigatesBackToTheGameList(detail);
    await gameList.selectLanguage('de');
    await gameList.selectGender('female');

    // Confirm female form is shown
    await expect(page.getByText('1 Spielerin', { exact: true })).toBeVisible();

    // Switch back to male
    await gameList.selectGender('male');

    // Male form is restored
    await expect(page.getByText('1 Spieler', { exact: true })).toBeVisible();
  });

  // ─── REQ-35e: Persistence ──────────────────────────────────────────────────

  test('REQ-35e — given female gender is selected in German, it persists across page reloads', async ({
    given,
    when,
    page,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice'],
      threshold: 100,
    });
    const gameList = await when.theUserNavigatesBackToTheGameList(detail);
    await gameList.selectLanguage('de');
    await gameList.selectGender('female');

    // Reload the page
    await when.theUserReloadsThePage();

    // Female form is still shown after reload
    await expect(page.getByText('1 Spielerin', { exact: true })).toBeVisible();
  });

  // ─── REQ-35f: Switching away from a gendered language ──────────────────────

  test('REQ-35f — given German is active, when the user switches to English, the gender toggle is hidden', async ({
    given,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    await gameList.selectLanguage('de');
    await then.theGenderToggleIsVisible(gameList);

    await gameList.selectLanguage('en');

    await then.theGenderToggleIsHidden(gameList);
  });
});
