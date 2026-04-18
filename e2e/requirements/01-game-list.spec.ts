import { test } from '../fixtures/index';

/**
 * REQ-1  The app shows a game list when opened.
 * REQ-2  The game list has a "New Game" button.
 * REQ-3  The game list shows an empty-state message when no games exist.
 * REQ-4  Games in the list show name, mode, round count, and current leader.
 * REQ-20 A game can be deleted from the list after confirming a prompt.
 * REQ-21 Deletion can be cancelled — the game remains in the list.
 */

test.describe('Game List', () => {
  test('REQ-1 / REQ-2 — given the app is opened, then the game list and New Game button are visible', async ({
    given,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();

    await then.theGameListIsVisible(gameList);
  });

  test('REQ-3 — given no games have been created, then an empty-state message is shown', async ({
    given,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();

    await then.theGameListIsEmpty(gameList);
  });

  test('REQ-4a — given a game exists, when the user goes back, then it appears in the game list', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({ name: 'Catan', players: ['Alice', 'Bob'] });
    const gameList = await when.theUserNavigatesBackToTheGameList(detail);

    await then.theGameListShowsGame(gameList, 'Catan');
  });

  test('REQ-4b — given a "lowest wins" game exists, then the mode label is shown in the list', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameHasRoundsPlayed(
      { name: 'Golf', players: ['Alice', 'Bob'], mode: 'lowest', threshold: 100 },
      [{ Alice: 5, Bob: 10 }],
    );
    const gameList = await when.theUserNavigatesBackToTheGameList(detail);

    await then.theGameShowsModeInList(gameList, 'Golf', 'lowest');
  });

  test('REQ-4c — given rounds have been played, then the list shows round count and current leader', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameHasRoundsPlayed(
      { name: 'Chess', players: ['Alice', 'Bob'], mode: 'highest', threshold: 200 },
      [{ Alice: 30, Bob: 20 }],
    );
    const gameList = await when.theUserNavigatesBackToTheGameList(detail);

    await then.theGameShowsRoundCountInList(gameList, 'Chess', 1);
    await then.theGameShowsLeaderInList(gameList, 'Alice');
  });

  test('REQ-20 — given a game exists, when the user deletes it, then it is removed from the list', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({ name: 'Delete Me', players: ['Alice'] });
    const gameList = await when.theUserNavigatesBackToTheGameList(detail);

    await when.theUserDeletesTheGame(gameList, 'Delete Me');

    await then.theGameListNoLongerShowsGame(gameList, 'Delete Me');
  });

  test('REQ-21 — given a delete prompt appears, when the user cancels, then the game remains', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({ name: 'Keep Me', players: ['Alice'] });
    const gameList = await when.theUserNavigatesBackToTheGameList(detail);

    await when.theUserCancelsGameDeletion(gameList, 'Keep Me');

    await then.theGameListShowsGame(gameList, 'Keep Me');
  });
});
