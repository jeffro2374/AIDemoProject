// Formatting utility functions

/**
 * Format currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Format a rating with stars
 */
export function formatRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '½';
  return `${stars} ${rating.toFixed(1)}`;
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Format room type for display
 */
export function formatRoomType(type) {
  return capitalizeWords(type.replace(/-/g, ' '));
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format amenity name
 */
export function formatAmenity(amenity) {
  const amenityNames = {
    'wifi': 'Free WiFi',
    'pool': 'Swimming Pool',
    'gym': 'Fitness Center',
    'restaurant': 'Restaurant',
    'parking': 'Free Parking',
    'beach-access': 'Beach Access',
    'spa': 'Spa',
    'fireplace': 'Fireplace',
    'ski-storage': 'Ski Storage'
  };
  return amenityNames[amenity] || capitalizeWords(amenity.replace(/-/g, ' '));
}

/**
 * Format guest name
 */
export function formatGuestName(firstName, lastName) {
  return `${firstName} ${lastName}`;
}

/**
 * Shorten reservation ID for display
 */
export function shortenId(id) {
  return id.substring(0, 8).toUpperCase();
}
