import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

// Common navigation steps
Given('I am on the homepage', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.search-section');
  // Wait for hotels to load
  await page.waitForSelector('.hotel-card', { timeout: 10000 });
});

Given('I am on the reservations page', async ({ page }) => {
  await page.goto('/reservations');
  await page.waitForSelector('.booking-section');
});

When('I click the logo', async ({ page }) => {
  await page.click('.logo');
});

When('I click {string} in the header', async ({ page }, linkText) => {
  await page.click(`nav a:has-text("${linkText}")`);
});

Then('I should be on the homepage', async ({ page }) => {
  await expect(page).toHaveURL('/');
});

Then('I should be on the reservations page', async ({ page }) => {
  await expect(page).toHaveURL('/reservations');
});

Then('I should see the search form', async ({ page }) => {
  await expect(page.locator('#search-form')).toBeVisible();
});

export { Given, When, Then };
