import type { Page, Locator } from '@playwright/test';

/**
 * Abstracts all interactions with the Game Detail screen (score table + round management).
 */
export class GameDetailPage {
  readonly scoreTable: Locator;
  readonly totalRow: Locator;
  readonly backButton: Locator;
  readonly resetButton: Locator;

  constructor(readonly page: Page) {
    this.scoreTable = page.getByRole('region', { name: 'Score table' });
    this.totalRow = page.getByRole('row', { name: 'Total scores' });
    this.backButton = page.getByRole('button', { name: 'Back to game list' });
    this.resetButton = page.getByRole('button', { name: 'Reset all scores to zero' });
  }

  gameTitle(name: string): Locator {
    return this.page.getByRole('heading', { name, exact: true });
  }

  playerColumn(playerName: string): Locator {
    return this.page.getByRole('columnheader', { name: playerName });
  }

  winnerColumn(playerName: string): Locator {
    return this.page.getByRole('columnheader', { name: new RegExp(`Winner.*${playerName}|${playerName}.*Winner`) });
  }

  leaderColumn(playerName: string): Locator {
    return this.page.getByRole('columnheader', { name: new RegExp(`Current leader.*${playerName}|${playerName}.*Current leader`) });
  }

  scoreInputForPlayer(playerName: string, roundNumber: number): Locator {
    return this.page.getByLabel(`${playerName} score for round ${roundNumber}`);
  }

  saveRoundButton(roundNumber: number): Locator {
    return this.page.getByRole('button', { name: `Save round ${roundNumber} scores` });
  }

  undoRoundButton(roundNumber: number): Locator {
    return this.page.getByRole('button', { name: `Undo round ${roundNumber}` });
  }

  confirmResetButton(): Locator {
    return this.page.getByRole('button', { name: 'Confirm reset all scores' });
  }

  cancelResetButton(): Locator {
    return this.page.getByRole('button', { name: 'Cancel reset' });
  }

  totalCellForPlayer(playerName: string): Locator {
    return this.page.getByLabel(`${playerName} total:`);
  }

  roundRow(roundNumber: number): Locator {
    return this.page.getByRole('row', { name: `Round ${roundNumber}` });
  }

  async enterRoundScores(scores: Record<string, number>, roundNumber: number): Promise<void> {
    for (const [player, score] of Object.entries(scores)) {
      await this.scoreInputForPlayer(player, roundNumber).fill(String(score));
    }
  }

  async saveRound(roundNumber: number): Promise<void> {
    await this.saveRoundButton(roundNumber).click();
  }

  async addRound(scores: Record<string, number>, roundNumber: number): Promise<void> {
    await this.enterRoundScores(scores, roundNumber);
    await this.saveRound(roundNumber);
  }

  async undoLastRound(roundNumber: number): Promise<void> {
    await this.undoRoundButton(roundNumber).click();
  }

  async clickReset(): Promise<void> {
    await this.resetButton.click();
  }

  async confirmReset(): Promise<void> {
    await this.confirmResetButton().click();
  }

  async cancelReset(): Promise<void> {
    await this.cancelResetButton().click();
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }
}
