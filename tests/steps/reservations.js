import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

// Reservation management steps
Then('I should see the empty reservations message', async ({ page }) => {
  await expect(page.locator('.empty-state')).toContainText('No reservations yet');
});

When('I go to the reservations page', async ({ page }) => {
  await page.click('nav a:has-text("My Reservations")');
  await page.waitForSelector('.booking-section');
});

Then('I should see my reservation', async ({ page }) => {
  await expect(page.locator('.reservation-card')).toBeVisible();
});

Then('the reservation status should be {string}', async ({ page }, status) => {
  await expect(page.locator('.status-badge')).toContainText(status);
});

When('I click "Cancel" on my reservation', async ({ page }) => {
  // Handle the confirmation dialog
  page.on('dialog', dialog => dialog.accept());
  await page.click('.cancel-btn');
  await page.waitForTimeout(500);
});

export { Given, When, Then };
