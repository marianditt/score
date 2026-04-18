import { test } from '../fixtures/index';

/**
 * REQ-28 Games persist across page reloads (localStorage).
 * REQ-29 Round scores persist across page reloads.
 * REQ-30 A game that was deleted does not reappear after reload.
 */

test.describe('Game Persistence', () => {
  test('REQ-28 — given a game was created, when the page is reloaded, then the game still appears in the list', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({ name: 'Catan', players: ['Alice', 'Bob'] });
    await when.theUserNavigatesBackToTheGameList(detail);

    const gameList = await when.theUserReloadsThePage();

    await then.theGameListShowsGame(gameList, 'Catan');
  });

  test('REQ-29 — given rounds were played, when the page is reloaded, then scores are preserved', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameHasRoundsPlayed(
      { name: 'Catan', players: ['Alice', 'Bob'], threshold: 200 },
      [{ Alice: 40, Bob: 30 }],
    );
    await when.theUserNavigatesBackToTheGameList(detail);
    const gameList = await when.theUserReloadsThePage();

    const reopenedDetail = await when.theUserOpensTheGame(gameList, 'Catan');

    await then.theTotalScoresAre(reopenedDetail, { Alice: 40, Bob: 30 });
    await then.theRoundAppearsInTheTable(reopenedDetail, 1);
  });

  test('REQ-30 — given a game was deleted, when the page is reloaded, then the game is still gone', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({ name: 'Gone Game', players: ['Alice'] });
    const gameList = await when.theUserNavigatesBackToTheGameList(detail);
    await when.theUserDeletesTheGame(gameList, 'Gone Game');

    const refreshedList = await when.theUserReloadsThePage();

    await then.theGameListNoLongerShowsGame(refreshedList, 'Gone Game');
  });
});
