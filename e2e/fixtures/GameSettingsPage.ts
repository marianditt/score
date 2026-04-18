import type { Page, Locator } from '@playwright/test';

/**
 * Abstracts all interactions with the in-game Game Settings screen.
 */
export class GameSettingsPage {
  readonly heading: Locator;
  readonly gameNameInput: Locator;
  readonly playerNameInput: Locator;
  readonly addPlayerButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly thresholdInput: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /Game Settings/i });
    this.gameNameInput = page.locator('#settings-game-name');
    this.playerNameInput = page.getByLabel('New player name');
    this.addPlayerButton = page.getByRole('button', { name: 'Add player' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.thresholdInput = page.locator('#settings-threshold');
  }

  removePlayerButton(playerName: string): Locator {
    return this.page.getByRole('button', { name: `Remove player ${playerName}` });
  }

  playerListItem(playerName: string): Locator {
    return this.page.getByRole('list', { name: 'Player list' }).getByText(playerName);
  }

  highestWinsButton(): Locator {
    return this.page.getByRole('button', { name: /Highest Wins/i });
  }

  lowestWinsButton(): Locator {
    return this.page.getByRole('button', { name: /Lowest Wins/i });
  }

  async addPlayer(name: string): Promise<void> {
    await this.playerNameInput.fill(name);
    await this.addPlayerButton.click();
  }

  async removePlayer(name: string): Promise<void> {
    await this.removePlayerButton(name).click();
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async setGameName(name: string): Promise<void> {
    await this.gameNameInput.fill(name);
  }

  async setThreshold(value: number): Promise<void> {
    await this.thresholdInput.fill(String(value));
  }
}
