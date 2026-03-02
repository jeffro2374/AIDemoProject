import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

// Helper to get today's date in YYYY-MM-DD format
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// Search form steps
When('I select {string} from the location dropdown', async ({ page }, location) => {
  await page.selectOption('#location', { label: location });
});

When('I click the search button', async ({ page }) => {
  await page.click('#search-form button[type="submit"]');
  await page.waitForSelector('.hotel-card, .empty-state');
});

Then('the check-in date should be today', async ({ page }) => {
  const checkInValue = await page.inputValue('#check-in');
  expect(checkInValue).toBe(getTodayDate());
});

Then('the check-out date should be tomorrow', async ({ page }) => {
  const checkOutValue = await page.inputValue('#check-out');
  expect(checkOutValue).toBe(getTomorrowDate());
});

When('I set check-in date to {string}', async ({ page }, date) => {
  await page.fill('#check-in', date);
});

When('I set check-out date to {string}', async ({ page }, date) => {
  await page.fill('#check-out', date);
});

When('I select {int} guests', async ({ page }, guests) => {
  await page.selectOption('#guests', String(guests));
});

export { Given, When, Then };
