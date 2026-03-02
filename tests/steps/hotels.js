import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

// Hotel browsing steps
Then('I should see {int} hotel card(s)', async ({ page }, count) => {
  await page.waitForSelector('.hotel-card');
  const cards = page.locator('.hotel-card');
  await expect(cards).toHaveCount(count);
});

Then('I should see {string}', async ({ page }, text) => {
  await expect(page.locator(`text=${text}`)).toBeVisible();
});

Then('I should not see {string}', async ({ page }, text) => {
  await expect(page.locator(`.hotel-card:has-text("${text}")`)).toHaveCount(0);
});

When('I click "View Rooms" on {string}', async ({ page }, hotelName) => {
  const hotelCard = page.locator(`.hotel-card:has-text("${hotelName}")`);
  await hotelCard.locator('.view-hotel-btn').click();
  await page.waitForSelector('.booking-section');
});

Then('I should see the hotel name {string}', async ({ page }, hotelName) => {
  await expect(page.locator('h2')).toContainText(hotelName);
});

Then('I should see available rooms', async ({ page }) => {
  await expect(page.locator('.room-card').first()).toBeVisible();
});

export { Given, When, Then };
