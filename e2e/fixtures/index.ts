import { test as base, expect } from '@playwright/test';
import { GameListPage } from './GameListPage';
import { GameSetupPage, type GameConfig } from './GameSetupPage';
import { GameDetailPage } from './GameDetailPage';

/**
 * ScoreTracker fixtures expose a fluent given/when/then API that maps
 * human-readable requirement language directly onto Playwright actions.
 *
 * Tests read like acceptance criteria — no Gherkin / Cucumber needed.
 */
export interface ScoreTrackerFixtures {
  gameListPage: GameListPage;
  gameSetupPage: GameSetupPage;
  gameDetailPage: GameDetailPage;
  given: {
    /** Navigate to the app and clear any persisted state. */
    theAppIsOpenWithNoSavedGames: () => Promise<GameListPage>;
    /** Navigate to the app keeping existing localStorage state. */
    theAppIsOpen: () => Promise<GameListPage>;
    /** Open a fully configured game that is ready to play. */
    aGameIsInProgress: (config: GameConfig) => Promise<GameDetailPage>;
    /** Open a game that has at least one round of scores recorded. */
    aGameHasRoundsPlayed: (
      config: GameConfig,
      rounds: Record<string, number>[],
    ) => Promise<GameDetailPage>;
  };
  when: {
    theUserClicksNewGame: (page: GameListPage) => Promise<GameSetupPage>;
    theUserConfiguresAndStartsAGame: (
      page: GameSetupPage,
      config: GameConfig,
    ) => Promise<GameDetailPage>;
    theUserAddsARound: (
      page: GameDetailPage,
      scores: Record<string, number>,
      roundNumber: number,
    ) => Promise<void>;
    theUserUndoesTheLastRound: (
      page: GameDetailPage,
      roundNumber: number,
    ) => Promise<void>;
    theUserResetsTheGame: (page: GameDetailPage) => Promise<void>;
    theUserNavigatesBackToTheGameList: (page: GameDetailPage) => Promise<GameListPage>;
    theUserDeletesTheGame: (page: GameListPage, gameName: string) => Promise<void>;
    theUserCancelsGameDeletion: (page: GameListPage, gameName: string) => Promise<void>;
    theUserOpensTheGame: (page: GameListPage, gameName: string) => Promise<GameDetailPage>;
    theUserReloadsThePage: () => Promise<GameListPage>;
  };
  then: {
    theGameListIsVisible: (page: GameListPage) => Promise<void>;
    theGameListIsEmpty: (page: GameListPage) => Promise<void>;
    theGameListShowsGame: (page: GameListPage, gameName: string) => Promise<void>;
    theGameListNoLongerShowsGame: (page: GameListPage, gameName: string) => Promise<void>;
    theGameSetupIsVisible: (page: GameSetupPage) => Promise<void>;
    theGameDetailIsVisible: (page: GameDetailPage, gameName: string) => Promise<void>;
    theScoreTableShowsPlayers: (page: GameDetailPage, players: string[]) => Promise<void>;
    theRoundAppearsInTheTable: (page: GameDetailPage, roundNumber: number) => Promise<void>;
    theRoundIsRemovedFromTheTable: (page: GameDetailPage, roundNumber: number) => Promise<void>;
    theTotalScoresAre: (
      page: GameDetailPage,
      totals: Record<string, number>,
    ) => Promise<void>;
    thePlayerIsTheLeader: (page: GameDetailPage, playerName: string) => Promise<void>;
    thePlayerIsTheWinner: (page: GameDetailPage, playerName: string) => Promise<void>;
    allScoresAreReset: (page: GameDetailPage, players: string[]) => Promise<void>;
    theStartButtonIsDisabled: (page: GameSetupPage) => Promise<void>;
    thePlayerAppearsToBe: (page: GameSetupPage, names: string[]) => Promise<void>;
    theGameShowsModeInList: (page: GameListPage, gameName: string, mode: 'highest' | 'lowest') => Promise<void>;
    theGameShowsLeaderInList: (page: GameListPage, leaderName: string) => Promise<void>;
    theGameShowsRoundCountInList: (page: GameListPage, gameName: string, count: number) => Promise<void>;
  };
}

export const test = base.extend<ScoreTrackerFixtures>({
  gameListPage: async ({ page }, use) => {
    await use(new GameListPage(page));
  },

  gameSetupPage: async ({ page }, use) => {
    await use(new GameSetupPage(page));
  },

  gameDetailPage: async ({ page }, use) => {
    await use(new GameDetailPage(page));
  },

  given: async ({ page }, use) => {
    const given = {
      theAppIsOpenWithNoSavedGames: async (): Promise<GameListPage> => {
        await page.goto('/score/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        return new GameListPage(page);
      },

      theAppIsOpen: async (): Promise<GameListPage> => {
        await page.goto('/score/');
        return new GameListPage(page);
      },

      aGameIsInProgress: async (config: GameConfig): Promise<GameDetailPage> => {
        await page.goto('/score/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        const list = new GameListPage(page);
        const setup = new GameSetupPage(page);
        const detail = new GameDetailPage(page);
        await list.clickNewGame();
        await setup.configureGame(config);
        await setup.startGame();
        return detail;
      },

      aGameHasRoundsPlayed: async (
        config: GameConfig,
        rounds: Record<string, number>[],
      ): Promise<GameDetailPage> => {
        await page.goto('/score/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        const list = new GameListPage(page);
        const setup = new GameSetupPage(page);
        const detail = new GameDetailPage(page);
        await list.clickNewGame();
        await setup.configureGame(config);
        await setup.startGame();
        for (let i = 0; i < rounds.length; i++) {
          await detail.addRound(rounds[i], i + 1);
        }
        return detail;
      },
    };
    await use(given);
  },

  when: async ({ page }, use) => {
    const when = {
      theUserClicksNewGame: async (list: GameListPage): Promise<GameSetupPage> => {
        await list.clickNewGame();
        return new GameSetupPage(page);
      },

      theUserConfiguresAndStartsAGame: async (
        setup: GameSetupPage,
        config: GameConfig,
      ): Promise<GameDetailPage> => {
        await setup.configureGame(config);
        await setup.startGame();
        return new GameDetailPage(page);
      },

      theUserAddsARound: async (
        detail: GameDetailPage,
        scores: Record<string, number>,
        roundNumber: number,
      ): Promise<void> => {
        await detail.addRound(scores, roundNumber);
      },

      theUserUndoesTheLastRound: async (
        detail: GameDetailPage,
        roundNumber: number,
      ): Promise<void> => {
        await detail.undoLastRound(roundNumber);
      },

      theUserResetsTheGame: async (detail: GameDetailPage): Promise<void> => {
        await detail.clickReset();
        await detail.confirmReset();
      },

      theUserNavigatesBackToTheGameList: async (detail: GameDetailPage): Promise<GameListPage> => {
        await detail.goBack();
        return new GameListPage(page);
      },

      theUserDeletesTheGame: async (list: GameListPage, gameName: string): Promise<void> => {
        await list.startDeleteGame(gameName);
        await list.confirmDeleteGame(gameName);
      },

      theUserCancelsGameDeletion: async (list: GameListPage, gameName: string): Promise<void> => {
        await list.startDeleteGame(gameName);
        await list.cancelDeleteGame();
      },

      theUserOpensTheGame: async (list: GameListPage, gameName: string): Promise<GameDetailPage> => {
        await list.openGame(gameName);
        return new GameDetailPage(page);
      },

      theUserReloadsThePage: async (): Promise<GameListPage> => {
        await page.reload();
        return new GameListPage(page);
      },
    };
    await use(when);
  },

  then: async ({ page }, use) => {
    const then = {
      theGameListIsVisible: async (list: GameListPage): Promise<void> => {
        await expect(list.heading).toBeVisible();
        await expect(list.newGameButton).toBeVisible();
      },

      theGameListIsEmpty: async (list: GameListPage): Promise<void> => {
        await expect(list.emptyStateMessage).toBeVisible();
      },

      theGameListShowsGame: async (list: GameListPage, gameName: string): Promise<void> => {
        await expect(list.gameCard(gameName)).toBeVisible();
      },

      theGameListNoLongerShowsGame: async (list: GameListPage, gameName: string): Promise<void> => {
        await expect(list.gameCard(gameName)).not.toBeVisible();
      },

      theGameSetupIsVisible: async (setup: GameSetupPage): Promise<void> => {
        await expect(setup.heading).toBeVisible();
        await expect(setup.gameNameInput).toBeVisible();
      },

      theGameDetailIsVisible: async (detail: GameDetailPage, gameName: string): Promise<void> => {
        await expect(detail.gameTitle(gameName)).toBeVisible();
        await expect(detail.scoreTable).toBeVisible();
      },

      theScoreTableShowsPlayers: async (detail: GameDetailPage, players: string[]): Promise<void> => {
        for (const player of players) {
          await expect(detail.playerColumn(player)).toBeVisible();
        }
      },

      theRoundAppearsInTheTable: async (detail: GameDetailPage, roundNumber: number): Promise<void> => {
        await expect(detail.roundRow(roundNumber)).toBeVisible();
      },

      theRoundIsRemovedFromTheTable: async (detail: GameDetailPage, roundNumber: number): Promise<void> => {
        await expect(detail.roundRow(roundNumber)).not.toBeVisible();
      },

      theTotalScoresAre: async (
        detail: GameDetailPage,
        totals: Record<string, number>,
      ): Promise<void> => {
        for (const [player, total] of Object.entries(totals)) {
          await expect(detail.page.getByLabel(`${player} total: ${total}`)).toBeVisible();
        }
      },

      thePlayerIsTheLeader: async (detail: GameDetailPage, playerName: string): Promise<void> => {
        await expect(detail.page.getByRole('columnheader').filter({ hasText: playerName })
          .getByLabel('Current leader')).toBeVisible();
      },

      thePlayerIsTheWinner: async (detail: GameDetailPage, playerName: string): Promise<void> => {
        await expect(detail.page.getByRole('columnheader').filter({ hasText: playerName })
          .getByLabel('Winner')).toBeVisible();
      },

      allScoresAreReset: async (detail: GameDetailPage, players: string[]): Promise<void> => {
        for (const player of players) {
          await expect(detail.page.getByLabel(`${player} total: 0`)).toBeVisible();
        }
      },

      theStartButtonIsDisabled: async (setup: GameSetupPage): Promise<void> => {
        await expect(setup.startGameButton).toBeDisabled();
      },

      thePlayerAppearsToBe: async (setup: GameSetupPage, names: string[]): Promise<void> => {
        for (const name of names) {
          await expect(setup.playerListItem(name)).toBeVisible();
        }
      },

      theGameShowsModeInList: async (list: GameListPage, gameName: string, mode: 'highest' | 'lowest'): Promise<void> => {
        const label = mode === 'highest' ? '↑ Highest wins' : '↓ Lowest wins';
        await expect(page.getByText(label).first()).toBeVisible();
      },

      theGameShowsLeaderInList: async (list: GameListPage, leaderName: string): Promise<void> => {
        await expect(page.getByText(`Leader:`).first()).toBeVisible();
        await expect(page.getByText(leaderName).first()).toBeVisible();
      },

      theGameShowsRoundCountInList: async (list: GameListPage, _gameName: string, count: number): Promise<void> => {
        await expect(page.getByText(`${count} round${count !== 1 ? 's' : ''}`).first()).toBeVisible();
      },
    };
    await use(then);
  },
});

export { expect };
