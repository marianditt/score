import { test } from '../fixtures/index';

/**
 * REQ-15 The game detail view shows the game name, player columns, and a score table.
 * REQ-16 Round scores can be entered and saved — saved rounds appear in the table.
 * REQ-17 Running totals update correctly after each round.
 * REQ-18 The current leader is highlighted (⭐) in "highest wins" mode.
 * REQ-18b The current leader is highlighted (⭐) in "lowest wins" mode.
 * REQ-19 A winner (🏆) is declared when a player's total reaches the threshold (highest wins).
 * REQ-19b A winner (🏆) is declared when any player reaches the threshold (lowest wins).
 * REQ-24 The last round can be undone — the row disappears and totals revert.
 * REQ-25 All scores can be reset to zero after confirming a prompt.
 * REQ-26 Cancelling a reset leaves scores unchanged.
 * REQ-27 Navigating back from the game detail returns the user to the game list.
 */

test.describe('Score Tracking', () => {
  test('REQ-15 — given a game is started, then the score table shows all player columns', async ({
    given,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob', 'Charlie'],
    });

    await then.theGameDetailIsVisible(detail, 'Catan');
    await then.theScoreTableShowsPlayers(detail, ['Alice', 'Bob', 'Charlie']);
  });

  test('REQ-16 — given a game is in progress, when a round is saved, then it appears in the score table', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      threshold: 200,
    });

    await when.theUserAddsARound(detail, { Alice: 30, Bob: 20 }, 1);

    await then.theRoundAppearsInTheTable(detail, 1);
  });

  test('REQ-17 — given rounds have been played, then the totals row shows the correct sums', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      threshold: 200,
    });

    await when.theUserAddsARound(detail, { Alice: 30, Bob: 20 }, 1);
    await when.theUserAddsARound(detail, { Alice: 10, Bob: 15 }, 2);

    await then.theTotalScoresAre(detail, { Alice: 40, Bob: 35 });
  });

  test('REQ-18 — given highest-wins mode and rounds played, then the player with the highest total is the leader', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Catan',
      players: ['Alice', 'Bob'],
      mode: 'highest',
      threshold: 200,
    });

    await when.theUserAddsARound(detail, { Alice: 50, Bob: 30 }, 1);

    await then.thePlayerIsTheLeader(detail, 'Alice');
  });

  test('REQ-18b — given lowest-wins mode and rounds played, then the player with the lowest total is the leader', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Golf',
      players: ['Alice', 'Bob'],
      mode: 'lowest',
      threshold: 200,
    });

    await when.theUserAddsARound(detail, { Alice: 20, Bob: 30 }, 1);

    await then.thePlayerIsTheLeader(detail, 'Alice');
  });

  test('REQ-19 — given highest-wins mode, when a player reaches the threshold, then they are the winner', async ({
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

    await then.thePlayerIsTheWinner(detail, 'Alice');
  });

  test('REQ-19b — given lowest-wins mode, when any player passes the threshold, then the lowest-scoring player wins', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({
      name: 'Golf',
      players: ['Alice', 'Bob'],
      mode: 'lowest',
      threshold: 50,
    });

    await when.theUserAddsARound(detail, { Alice: 20, Bob: 60 }, 1);

    await then.thePlayerIsTheWinner(detail, 'Alice');
  });

  test('REQ-24 — given a round was played, when the user undoes it, then the round disappears from the table', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameHasRoundsPlayed(
      { name: 'Catan', players: ['Alice', 'Bob'], threshold: 200 },
      [{ Alice: 30, Bob: 20 }],
    );

    await when.theUserUndoesTheLastRound(detail, 1);

    await then.theRoundIsRemovedFromTheTable(detail, 1);
    await then.theTotalScoresAre(detail, { Alice: 0, Bob: 0 });
  });

  test('REQ-25 — given scores exist, when the user resets and confirms, then all totals are zero', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameHasRoundsPlayed(
      { name: 'Catan', players: ['Alice', 'Bob'], threshold: 200 },
      [{ Alice: 40, Bob: 30 }, { Alice: 20, Bob: 10 }],
    );

    await when.theUserResetsTheGame(detail);

    await then.allScoresAreReset(detail, ['Alice', 'Bob']);
  });

  test('REQ-26 — given a reset prompt appears, when the user cancels, then scores remain unchanged', async ({
    given,
    then,
  }) => {
    const detail = await given.aGameHasRoundsPlayed(
      { name: 'Catan', players: ['Alice', 'Bob'], threshold: 200 },
      [{ Alice: 40, Bob: 30 }],
    );

    await detail.clickReset();
    await detail.cancelReset();

    await then.theTotalScoresAre(detail, { Alice: 40, Bob: 30 });
  });

  test('REQ-27 — given the user is on the game detail, when they navigate back, then the game list is shown', async ({
    given,
    when,
    then,
  }) => {
    const detail = await given.aGameIsInProgress({ name: 'Catan', players: ['Alice'] });
    const gameList = await when.theUserNavigatesBackToTheGameList(detail);

    await then.theGameListIsVisible(gameList);
  });
});
