import { test, expect } from '../fixtures/index';

/**
 * REQ-35 In the first round (no rounds played yet) nobody leads.
 * REQ-36 Multiple players tied for the best score all lead simultaneously.
 * REQ-37 Multiple players tied for the best score all win simultaneously.
 * REQ-38 When the game ends no more rounds can be added.
 * REQ-39 When the game ends the last round can still be undone.
 * REQ-40 When the game ends a confetti animation is shown.
 * REQ-41 Confetti is hidden in high-contrast mode.
 * REQ-42 Lead/winner icons are shown above the player name (stable layout).
 * REQ-43 Game settings can be edited during a game.
 * REQ-44 Players added during a running game start with 0 points (no scores).
 */

test.describe('Game Enhancements', () => {
  // ─── REQ-35: Nobody leads before any rounds are played ──────────────────

  test('REQ-35 — given a game just started with no rounds, then nobody is marked as leader', async ({
    given,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      mode: 'highest',
      threshold: 100,
    });

    // No leader icon should be present anywhere in column headers
    await expect(detail.page.getByRole('columnheader').getByLabel('Current leader')).not.toBeAttached();
  });

  // ─── REQ-36: Multiple tied leaders ─────────────────────────────────────

  test('REQ-36a — given two players tied for the lead (highest wins), both are shown as leaders', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      mode: 'highest',
      threshold: 100,
    });

    await when.theUserAddsARound(detail, { Alice: 30, Bob: 30 }, 1);

    await then.theMultiplePlayersAreLeaders(detail, ['Alice', 'Bob']);
  });

  test('REQ-36b — given two players tied for the lead (lowest wins), both are shown as leaders', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Golf',
      players: ['Alice', 'Bob'],
      mode: 'lowest',
      threshold: 100,
    });

    await when.theUserAddsARound(detail, { Alice: 10, Bob: 10 }, 1);

    await then.theMultiplePlayersAreLeaders(detail, ['Alice', 'Bob']);
  });

  test('REQ-36c — given only one player is best, only that player leads', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      mode: 'highest',
      threshold: 100,
    });

    await when.theUserAddsARound(detail, { Alice: 50, Bob: 30 }, 1);

    await then.thePlayerIsTheLeader(detail, 'Alice');
    // Bob should NOT have a leader icon
    await expect(detail.page.getByRole('columnheader').filter({ hasText: 'Bob' })
      .getByLabel('Current leader')).not.toBeAttached();
  });

  // ─── REQ-37: Multiple tied winners ─────────────────────────────────────

  test('REQ-37a — given two players reach the threshold with equal highest score, both win', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      mode: 'highest',
      threshold: 50,
    });

    await when.theUserAddsARound(detail, { Alice: 60, Bob: 60 }, 1);

    await then.theMultiplePlayersAreWinners(detail, ['Alice', 'Bob']);
  });

  test('REQ-37b — given lowest-wins mode and both players tie for lowest when game ends, both win', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Golf',
      players: ['Alice', 'Bob', 'Charlie'],
      mode: 'lowest',
      threshold: 50,
    });

    // Charlie hits the threshold; Alice and Bob are tied lowest
    await when.theUserAddsARound(detail, { Alice: 10, Bob: 10, Charlie: 60 }, 1);

    await then.theMultiplePlayersAreWinners(detail, ['Alice', 'Bob']);
  });

  // ─── REQ-38: No more rounds when game ends ──────────────────────────────

  test('REQ-38 — given the game is over, then the save-round button is no longer shown', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      mode: 'highest',
      threshold: 50,
    });

    await when.theUserAddsARound(detail, { Alice: 60, Bob: 20 }, 1);

    // The save button for round 2 should not be present
    await then.theSaveRoundButtonIsHidden(detail, 2);
  });

  // ─── REQ-39: Undo still works after game ends ───────────────────────────

  test('REQ-39 — given the game is over, the undo button for the last round is still visible', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      mode: 'highest',
      threshold: 50,
    });

    await when.theUserAddsARound(detail, { Alice: 60, Bob: 20 }, 1);

    await then.theUndoRoundButtonIsVisible(detail, 1);
  });

  test('REQ-39b — given the game is over, when the user undoes the last round, the game is no longer over', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      mode: 'highest',
      threshold: 50,
    });

    await when.theUserAddsARound(detail, { Alice: 60, Bob: 20 }, 1);
    await when.theUserUndoesTheLastRound(detail, 1);

    // After undo the save button reappears — game is no longer over
    await expect(detail.saveRoundButton(1)).toBeVisible();
  });

  // ─── REQ-40: Confetti animation when game ends ──────────────────────────

  test('REQ-40 — given the game ends, a confetti animation is shown', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      mode: 'highest',
      threshold: 50,
    });

    await when.theUserAddsARound(detail, { Alice: 60, Bob: 20 }, 1);

    await then.theConfettiIsVisible(detail);
  });

  test('REQ-40b — given no winner yet, confetti is not shown', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      mode: 'highest',
      threshold: 100,
    });

    await when.theUserAddsARound(detail, { Alice: 30, Bob: 20 }, 1);

    await then.theConfettiIsHidden(detail);
  });

  // ─── REQ-41: Confetti hidden in high-contrast mode ──────────────────────

  test('REQ-41 — given high-contrast mode is on, confetti is hidden when the game ends', async ({
    given,
    when,
    page,
  }) => {
    // Enable high contrast before starting the game
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    await gameList.toggleHighContrast();

    const setup = await when.theUserClicksNewGame(gameList);
    const detail = await when.theUserConfiguresAndStartsAGame(setup, {
      name: 'Catan',
      players: ['Alice', 'Bob'],
      mode: 'highest',
      threshold: 50,
    });

    await when.theUserAddsARound(detail, { Alice: 60, Bob: 20 }, 1);

    // Confetti element should not be in the DOM at all
    await expect(page.getByTestId('confetti')).not.toBeAttached();
  });

  // ─── REQ-42: Lead/winner icons above player name ────────────────────────

  test('REQ-42 — given a leader, the leader icon appears in the column header containing the player name', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      mode: 'highest',
      threshold: 100,
    });

    await when.theUserAddsARound(detail, { Alice: 50, Bob: 20 }, 1);

    // The ⭐ should be inside Alice's column header (icon above name in same th)
    await then.thePlayerIsTheLeader(detail, 'Alice');
  });

  // ─── REQ-43: Edit game settings during a game ───────────────────────────

  test('REQ-43a — given a game is in progress, the edit settings button is visible', async ({
    given,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      threshold: 100,
    });

    await expect(detail.editSettingsButton).toBeVisible();
  });

  test('REQ-43b — given edit settings is open, when the user changes the game name and saves, the new name is shown', async ({
    given,
    when,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      threshold: 100,
    });

    const settings = await when.theUserOpensGameSettings(detail);
    await settings.setGameName('My Catan');
    await settings.save();

    await expect(detail.gameTitle('My Catan')).toBeVisible();
  });

  test('REQ-43c — given edit settings, when the user cancels, the game is unchanged', async ({
    given,
    when,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      threshold: 100,
    });

    const settings = await when.theUserOpensGameSettings(detail);
    await settings.setGameName('Changed Name');
    await settings.cancel();

    // Original name is still shown
    await expect(detail.gameTitle('Catan')).toBeVisible();
  });

  // ─── REQ-44: New players added mid-game start with 0 points ─────────────

  test('REQ-44 — given a game is in progress, when a new player is added, they start with 0 total', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameHasRoundsPlayed(
      { name: 'Catan', players: ['Alice', 'Bob'], threshold: 200 },
      [{ Alice: 30, Bob: 20 }],
    );

    const settings = await when.theUserOpensGameSettings(detail);
    await settings.addPlayer('Charlie');
    await settings.save();

    // Charlie starts at 0
    await then.theTotalScoresAre(detail, { Charlie: 0 });
    // Alice and Bob retain their scores
    await then.theTotalScoresAre(detail, { Alice: 30, Bob: 20 });
  });
});
