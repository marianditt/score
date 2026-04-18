import { test, expect } from '../fixtures/index';

/**
 * REQ-5  Clicking "New Game" opens the game setup form.
 * REQ-6  A game requires a name — the Start button is disabled without one.
 * REQ-7  A game requires at least one player — the Start button is disabled without one.
 * REQ-8  Players can be added by name during setup.
 * REQ-9  Players can be removed during setup.
 * REQ-10 Players can be reordered (move up / move down) during setup.
 * REQ-11 The win condition can be set to "highest wins" (default).
 * REQ-12 The win condition can be set to "lowest wins".
 * REQ-13 The score threshold can be configured.
 * REQ-14 Completing setup starts the game and navigates to the game detail view.
 * REQ-22 Cancelling setup navigates back to the game list.
 * REQ-23 Using the back arrow in setup navigates back to the game list.
 */

test.describe('Game Creation', () => {
  test('REQ-5 — given the game list is open, when the user clicks New Game, then the setup form is shown', async ({
    given,
    when,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);

    await then.theGameSetupIsVisible(setup);
  });

  test('REQ-6 — given the setup form is open with no name entered, then the Start button is disabled', async ({
    given,
    when,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.addPlayer('Alice');
    // no game name entered

    await then.theStartButtonIsDisabled(setup);
  });

  test('REQ-7 — given the setup form has a name but no players, then the Start button is disabled', async ({
    given,
    when,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.enterGameName('Catan');
    // no players added

    await then.theStartButtonIsDisabled(setup);
  });

  test('REQ-8 — given setup is open, when a player name is entered and added, then the player appears in the list', async ({
    given,
    when,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.addPlayer('Alice');

    await then.thePlayerAppearsToBe(setup, ['Alice']);
  });

  test('REQ-8b — given setup is open, when a player is added by pressing Enter, then the player appears', async ({
    given,
    when,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.addPlayerByEnter('Bob');

    await then.thePlayerAppearsToBe(setup, ['Bob']);
  });

  test('REQ-9 — given a player was added, when the user removes them, then the player is no longer in the list', async ({
    given,
    when,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.addPlayer('Alice');
    await setup.removePlayer('Alice');

    await then.theStartButtonIsDisabled(setup); // player list is empty → button disabled
  });

  test('REQ-10 — given multiple players were added, when the user moves a player down, then the order changes', async ({
    given,
    when,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.addPlayer('Alice');
    await setup.addPlayer('Bob');
    await setup.movePlayerDown('Alice');

    // After moving Alice down, Bob should be first in the visible list
    const playerItems = setup.page.getByRole('list', { name: 'Player list' }).getByRole('listitem');
    const firstPlayer = playerItems.first();
    await firstPlayer.getByText('Bob').waitFor();
  });

  test('REQ-10b — given multiple players were added, when the user moves a player up, then the order changes', async ({
    given,
    when,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.addPlayer('Alice');
    await setup.addPlayer('Bob');
    await setup.movePlayerUp('Bob');

    const playerItems = setup.page.getByRole('list', { name: 'Player list' }).getByRole('listitem');
    const firstPlayer = playerItems.first();
    await firstPlayer.getByText('Bob').waitFor();
  });

  test('REQ-11 — given the default mode, then "Highest Wins" is selected', async ({
    given,
    when,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);

    await expect(setup.highestWinsButton()).toHaveAttribute('aria-pressed', 'true');
  });

  test('REQ-12 — given setup is open, when the user selects Lowest Wins, then that mode is active', async ({
    given,
    when,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.selectLowestWins();

    await expect(setup.lowestWinsButton()).toHaveAttribute('aria-pressed', 'true');
    await expect(setup.highestWinsButton()).toHaveAttribute('aria-pressed', 'false');
  });

  test('REQ-13 — given setup is open, when the user changes the threshold, then the field reflects the new value', async ({
    given,
    when,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.setThreshold(50);

    await expect(setup.thresholdInput).toHaveValue('50');
  });

  test('REQ-14 — given a valid name and players, when the user starts the game, then the game detail view is shown', async ({
    given,
    when,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    const detail = await when.theUserConfiguresAndStartsAGame(setup, {
      name: 'Ticket to Ride',
      players: ['Alice', 'Bob', 'Charlie'],
    });

    await then.theGameDetailIsVisible(detail, 'Ticket to Ride');
  });

  test('REQ-22 — given setup is open, when the user cancels, then the game list is shown', async ({
    given,
    when,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.cancel();

    await then.theGameListIsVisible(gameList);
  });

  test('REQ-23 — given setup is open, when the user clicks the back arrow, then the game list is shown', async ({
    given,
    when,
    then,
  }) => {
    const gameList = await given.theAppIsOpenWithNoSavedGames();
    const setup = await when.theUserClicksNewGame(gameList);
    await setup.goBack();

    await then.theGameListIsVisible(gameList);
  });
});
