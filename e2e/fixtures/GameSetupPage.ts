import type { Page, Locator } from '@playwright/test';

export interface GameConfig {
  name: string;
  players: string[];
  mode?: 'highest' | 'lowest';
  threshold?: number;
}

/**
 * Abstracts all interactions with the Game Setup screen.
 */
export class GameSetupPage {
  readonly heading: Locator;
  readonly gameNameInput: Locator;
  readonly playerNameInput: Locator;
  readonly addPlayerButton: Locator;
  readonly startGameButton: Locator;
  readonly cancelButton: Locator;
  readonly backButton: Locator;
  readonly thresholdInput: Locator;
  readonly startHint: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /New Game Setup/i });
    this.gameNameInput = page.locator('#setup-game-name');
    this.playerNameInput = page.getByLabel('New player name');
    this.addPlayerButton = page.getByRole('button', { name: 'Add player' });
    this.startGameButton = page.getByRole('button', { name: 'Start Game' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.backButton = page.getByRole('button', { name: 'Cancel and go back to game list' });
    this.thresholdInput = page.locator('#setup-threshold');
    this.startHint = page.locator('#start-hint');
  }

  highestWinsButton(): Locator {
    return this.page.getByRole('button', { name: /Highest Wins/i });
  }

  lowestWinsButton(): Locator {
    return this.page.getByRole('button', { name: /Lowest Wins/i });
  }

  movePlayerUpButton(playerName: string): Locator {
    return this.page.getByRole('button', { name: `Move ${playerName} up` });
  }

  movePlayerDownButton(playerName: string): Locator {
    return this.page.getByRole('button', { name: `Move ${playerName} down` });
  }

  removePlayerButton(playerName: string): Locator {
    return this.page.getByRole('button', { name: `Remove player ${playerName}` });
  }

  playerListItem(playerName: string): Locator {
    return this.page.getByRole('list', { name: 'Player list' }).getByText(playerName);
  }

  async enterGameName(name: string): Promise<void> {
    await this.gameNameInput.fill(name);
  }

  async addPlayer(name: string): Promise<void> {
    await this.playerNameInput.fill(name);
    await this.addPlayerButton.click();
  }

  async addPlayerByEnter(name: string): Promise<void> {
    await this.playerNameInput.fill(name);
    await this.playerNameInput.press('Enter');
  }

  async removePlayer(name: string): Promise<void> {
    await this.removePlayerButton(name).click();
  }

  async movePlayerUp(name: string): Promise<void> {
    await this.movePlayerUpButton(name).click();
  }

  async movePlayerDown(name: string): Promise<void> {
    await this.movePlayerDownButton(name).click();
  }

  async selectHighestWins(): Promise<void> {
    await this.highestWinsButton().click();
  }

  async selectLowestWins(): Promise<void> {
    await this.lowestWinsButton().click();
  }

  async setThreshold(value: number): Promise<void> {
    await this.thresholdInput.fill(String(value));
  }

  async configureGame(config: GameConfig): Promise<void> {
    await this.enterGameName(config.name);
    for (const player of config.players) {
      await this.addPlayer(player);
    }
    if (config.mode === 'lowest') {
      await this.selectLowestWins();
    }
    // Threshold is now required (must be > 0). Default to 100 when not specified.
    await this.setThreshold(config.threshold !== undefined ? config.threshold : 100);
  }

  async startGame(): Promise<void> {
    await this.startGameButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }
}
