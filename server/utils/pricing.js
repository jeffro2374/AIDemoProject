// Pricing calculation utilities

const { calculateNights } = require('./dateUtils');

/**
 * Calculate the total price for a reservation
 */
function calculateTotalPrice(roomPrice, checkIn, checkOut) {
  const nights = calculateNights(checkIn, checkOut);
  const subtotal = roomPrice * nights;
  const taxes = calculateTaxes(subtotal);
  const fees = calculateFees(nights);

  return {
    nights,
    pricePerNight: roomPrice,
    subtotal,
    taxes,
    fees,
    total: subtotal + taxes + fees
  };
}

/**
 * Calculate taxes (assumed 12% tax rate)
 */
function calculateTaxes(subtotal) {
  const TAX_RATE = 0.12;
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}

/**
 * Calculate fees (resort fee + cleaning fee)
 */
function calculateFees(nights) {
  const RESORT_FEE_PER_NIGHT = 25;
  const CLEANING_FEE = 50;
  return (RESORT_FEE_PER_NIGHT * nights) + CLEANING_FEE;
}

/**
 * Apply a discount code
 */
function applyDiscount(total, discountCode) {
  const discounts = {
    'SAVE10': 0.10,
    'SAVE20': 0.20,
    'WELCOME': 0.15
  };

  const discountRate = discounts[discountCode?.toUpperCase()];
  if (!discountRate) {
    return { valid: false, total, discount: 0 };
  }

  const discount = Math.round(total * discountRate * 100) / 100;
  return {
    valid: true,
    total: total - discount,
    discount,
    discountRate: discountRate * 100
  };
}

module.exports = {
  calculateTotalPrice,
  calculateTaxes,
  calculateFees,
  applyDiscount
};
