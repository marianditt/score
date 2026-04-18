import { test, expect } from '../fixtures/index';

/**
 * REQ-31 During setup the target score is not prefilled. A placeholder shows 100.
 *        Users must enter a number larger than 0 before the Start button enables.
 * REQ-32 The score board table is mobile-friendly: up to 6 players fit without
 *        horizontal scrolling on a phone-sized viewport.
 * REQ-33 Users can change the page language from the landing page.
 * REQ-34 A high-contrast accessibility mode can be toggled from the landing page.
 */

test.describe('New Features', () => {
  // ─── REQ-31: Target score not pre-filled ────────────────────────────────

  test('REQ-31a — given setup is open, then the threshold field is empty with placeholder 100', async ({
    given,
    when,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);

    await expect(setup.thresholdInput).toHaveValue('');
    await expect(setup.thresholdInput).toHaveAttribute('placeholder', '100');
  });

  test('REQ-31b — given setup has a name and players but no threshold, then the Start button is disabled', async ({
    given,
    when,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.enterGameName('Catan');
    await setup.addPlayer('Alice');
    // threshold intentionally left empty

    await then.theStartButtonIsDisabled(setup);
  });

  test('REQ-31c — given setup has a name and players and threshold 0, then the Start button is disabled', async ({
    given,
    when,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.enterGameName('Catan');
    await setup.addPlayer('Alice');
    await setup.setThreshold(0);

    await then.theStartButtonIsDisabled(setup);
  });

  test('REQ-31d — given a valid name, players, and threshold > 0, then the Start button is enabled', async ({
    given,
    when,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.enterGameName('Catan');
    await setup.addPlayer('Alice');
    await setup.setThreshold(50);

    await expect(setup.startGameButton).toBeEnabled();
  });

  // ─── REQ-32: Mobile-friendly score table ────────────────────────────────

  test('REQ-32 — given 6 players on a mobile viewport, the score table fits without horizontal scrolling', async ({
    given,
    page,
  }) => {
    // iPhone SE width (375 px) — the tightest common phone width
    await page.setViewportSize({ width: 375, height: 667 });

    const detail = await given.aGameIsInProgress({
      name: 'Big Game',
      players: ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank'],
      threshold: 100,
    });

    const scoreTable = detail.scoreTable;
    await expect(scoreTable).toBeVisible();

    // The wrapping region must not cause horizontal overflow on the page
    const pageScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const pageClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(pageScrollWidth).toBeLessThanOrEqual(pageClientWidth);
  });

  // ─── REQ-33: Language switcher ──────────────────────────────────────────

  test('REQ-33a — given the landing page, then a language selector is visible', async ({
    given,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    await expect(gameList.languageSelector).toBeVisible();
  });

  test('REQ-33b — given the user selects German, then the UI switches to German', async ({
    given,
    page,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    await gameList.selectLanguage('de');

    // German app title
    await expect(page.getByRole('heading', { name: 'Punktestand' })).toBeVisible();
  });

  test('REQ-33c — given a language is selected, it is persisted across page reloads', async ({
    given,
    when,
    page,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    await gameList.selectLanguage('es');

    await when.theUserReloadsThePage();

    // Spanish subtitle
    await expect(page.getByText('Registra las puntuaciones')).toBeVisible();
  });

  test('REQ-33d — given Arabic is selected, the page direction becomes right-to-left', async ({
    given,
    page,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    await gameList.selectLanguage('ar');

    const dir = await page.evaluate(() => document.documentElement.dir);
    expect(dir).toBe('rtl');
  });

  // ─── REQ-34: High-contrast mode ─────────────────────────────────────────

  test('REQ-34a — given the landing page, then a high-contrast toggle is visible', async ({
    given,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    await expect(gameList.highContrastToggle).toBeVisible();
  });

  test('REQ-34b — given the user enables high contrast, then the html element carries data-hc="true"', async ({
    given,
    page,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    await gameList.toggleHighContrast();

    const attr = await page.evaluate(() => document.documentElement.getAttribute('data-hc'));
    expect(attr).toBe('true');
  });

  test('REQ-34c — given high contrast is on, toggling it off removes the attribute', async ({
    given,
    page,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    await gameList.toggleHighContrast(); // on
    await gameList.toggleHighContrast(); // off

    const attr = await page.evaluate(() => document.documentElement.getAttribute('data-hc'));
    expect(attr).toBeNull();
  });

  test('REQ-34d — given high contrast is enabled, it persists across page reloads', async ({
    given,
    when,
    page,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    await gameList.toggleHighContrast();

    await when.theUserReloadsThePage();

    const attr = await page.evaluate(() => document.documentElement.getAttribute('data-hc'));
    expect(attr).toBe('true');
  });
});
