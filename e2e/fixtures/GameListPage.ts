import type { Page, Locator } from '@playwright/test';

/**
 * Abstracts all interactions with the Game List screen.
 */
export class GameListPage {
  readonly heading: Locator;
  readonly newGameButton: Locator;
  readonly emptyStateMessage: Locator;
  readonly gameList: Locator;
  readonly languageSelector: Locator;
  readonly highContrastToggle: Locator;
  readonly genderToggle: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /Score Tracker/i });
    this.newGameButton = page.getByRole('button', { name: /new game/i });
    this.emptyStateMessage = page.getByText(/No games yet/i);
    this.gameList = page.getByRole('list', { name: /Saved games/i });
    this.languageSelector = page.getByTestId('language-selector');
    this.highContrastToggle = page.getByTestId('high-contrast-toggle');
    this.genderToggle = page.getByTestId('gender-toggle');
  }

  gameCard(name: string): Locator {
    return this.page.getByRole('button', { name: `Open game: ${name}` });
  }

  deleteButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Delete game: ${name}` });
  }

  confirmDeleteButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Confirm delete ${name}` });
  }

  cancelDeleteButton(): Locator {
    return this.page.getByRole('button', { name: 'Cancel delete' });
  }

  gameModeLabel(name: string): Locator {
    return this.gameCard(name).locator('xpath=ancestor::div[1]').locator('..');
  }

  async clickNewGame(): Promise<void> {
    await this.newGameButton.click();
  }

  async openGame(name: string): Promise<void> {
    await this.gameCard(name).click();
  }

  async startDeleteGame(name: string): Promise<void> {
    await this.deleteButton(name).click();
  }

  async confirmDeleteGame(name: string): Promise<void> {
    await this.confirmDeleteButton(name).click();
  }

  async cancelDeleteGame(): Promise<void> {
    await this.cancelDeleteButton().click();
  }

  async selectLanguage(langCode: string): Promise<void> {
    await this.languageSelector.click();
    await this.page.getByTestId(`lang-option-${langCode}`).click();
  }

  async toggleHighContrast(): Promise<void> {
    await this.highContrastToggle.click();
  }

  async selectGender(gender: 'male' | 'female'): Promise<void> {
    const pressed = await this.genderToggle.getAttribute('aria-pressed');
    const isFemale = pressed === 'true';
    if ((gender === 'female' && !isFemale) || (gender === 'male' && isFemale)) {
      await this.genderToggle.click();
    }
  }
}
