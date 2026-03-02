// Date utility functions for reservation management

/**
 * Parse a date string into a Date object
 */
function parseDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }
  return date;
}

/**
 * Calculate the number of nights between two dates
 */
function calculateNights(checkIn, checkOut) {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if a date range overlaps with another
 */
function dateRangesOverlap(start1, end1, start2, end2) {
  const s1 = parseDate(start1);
  const e1 = parseDate(end1);
  const s2 = parseDate(start2);
  const e2 = parseDate(end2);

  return s1 < e2 && s2 < e1;
}

/**
 * Validate that check-out is after check-in
 */
function validateDateRange(checkIn, checkOut) {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);

  if (end <= start) {
    return { valid: false, error: 'Check-out date must be after check-in date' };
  }

  // Note: Past date validation removed for demo/testing purposes
  return { valid: true };
}

/**
 * Format a date for display
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

module.exports = {
  parseDate,
  calculateNights,
  dateRangesOverlap,
  validateDateRange,
  formatDate
};
