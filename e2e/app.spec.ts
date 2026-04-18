import { test, expect } from '@playwright/test';

test('page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/score/);
});

test('base url has the correct /score path for GitHub Pages deployment', async ({ page, baseURL }) => {
  expect(baseURL).toContain('/score');
});
