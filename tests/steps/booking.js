import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

// Booking steps
When('I click "Book Now" on the first room', async ({ page }) => {
  await page.click('.room-card .book-room-btn');
  await page.waitForSelector('.booking-section');
});

Then('I should see the booking form', async ({ page }) => {
  await expect(page.locator('#booking-form')).toBeVisible();
});

Then('I should see the booking summary', async ({ page }) => {
  await expect(page.locator('.booking-summary')).toBeVisible();
});

Then('I should see the total price', async ({ page }) => {
  await expect(page.locator('.summary-row:last-child')).toContainText('$');
});

When('I fill in the booking form with:', async ({ page }, dataTable) => {
  const data = dataTable.rowsHash();

  if (data.firstName) {
    await page.fill('#firstName', data.firstName);
  }
  if (data.lastName) {
    await page.fill('#lastName', data.lastName);
  }
  if (data.email) {
    await page.fill('#email', data.email);
  }
  if (data.discountCode) {
    await page.fill('#discountCode', data.discountCode);
  }
});

When('I click "Confirm Booking"', async ({ page }) => {
  await page.click('#booking-form button[type="submit"]');
  // Wait for navigation to confirmation page or error message
  await page.waitForSelector('.message-success, .message-error', { timeout: 15000 });
});

Then('I should see the booking confirmation', async ({ page }) => {
  // Wait for the success message to appear
  await expect(page.locator('.message-success')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.message-success')).toContainText('Booking Confirmed');
});

When('I click "Back to Home"', async ({ page }) => {
  await page.click('button:has-text("Back to Home")');
  await page.waitForSelector('.search-section');
});

// Helper to get future dates to avoid booking conflicts
function getFutureDates(daysAhead = 7) {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + daysAhead);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1);
  return {
    checkIn: checkIn.toISOString().split('T')[0],
    checkOut: checkOut.toISOString().split('T')[0]
  };
}

// Helper for making a booking programmatically
Given('I have made a booking at {string}', async ({ page }, hotelName) => {
  const dates = getFutureDates(7 + Math.floor(Math.random() * 10));

  await page.goto(`/?checkIn=${dates.checkIn}&checkOut=${dates.checkOut}`);
  await page.waitForSelector('.search-section');
  await page.waitForSelector('.hotel-card', { timeout: 10000 });

  const hotelCard = page.locator(`.hotel-card:has-text("${hotelName}")`);
  await hotelCard.locator('.view-hotel-btn').click();
  await page.waitForSelector('.room-card', { timeout: 10000 });

  await page.click('.room-card .book-room-btn');
  await page.waitForSelector('#booking-form', { timeout: 10000 });

  await page.fill('#firstName', 'Test');
  await page.fill('#lastName', 'User');
  await page.fill('#email', `test${Date.now()}@example.com`);

  await page.click('#booking-form button[type="submit"]');
  await page.waitForSelector('.message-success', { timeout: 10000 });
});

Given('I have completed a booking', async ({ page }) => {
  const dates = getFutureDates(14 + Math.floor(Math.random() * 10));

  await page.goto(`/?checkIn=${dates.checkIn}&checkOut=${dates.checkOut}`);
  await page.waitForSelector('.search-section');
  await page.waitForSelector('.hotel-card', { timeout: 10000 });

  await page.click('.hotel-card .view-hotel-btn');
  await page.waitForSelector('.room-card', { timeout: 10000 });

  await page.click('.room-card .book-room-btn');
  await page.waitForSelector('#booking-form', { timeout: 10000 });

  await page.fill('#firstName', 'Test');
  await page.fill('#lastName', 'User');
  await page.fill('#email', `test${Date.now()}@example.com`);

  await page.click('#booking-form button[type="submit"]');
  await page.waitForSelector('.message-success', { timeout: 10000 });
});

export { Given, When, Then };
