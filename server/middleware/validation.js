// Validation middleware for API requests

/**
 * Validate reservation request body
 */
function validateReservation(req, res, next) {
  const { roomId, guestId, checkIn, checkOut } = req.body;
  const errors = [];

  if (!roomId) {
    errors.push('Room ID is required');
  }

  if (!guestId) {
    errors.push('Guest ID is required');
  }

  if (!checkIn) {
    errors.push('Check-in date is required');
  }

  if (!checkOut) {
    errors.push('Check-out date is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
}

/**
 * Validate guest registration request body
 */
function validateGuest(req, res, next) {
  const { firstName, lastName, email } = req.body;
  const errors = [];

  if (!firstName || firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  }

  if (!lastName || lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email address is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
}

/**
 * Validate search parameters
 */
function validateSearch(req, res, next) {
  const { checkIn, checkOut, guests } = req.query;

  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Check-out must be after check-in' });
    }
  }

  if (guests && (isNaN(parseInt(guests)) || parseInt(guests) < 1)) {
    return res.status(400).json({ error: 'Guests must be a positive number' });
  }

  next();
}

/**
 * Simple email validation
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  validateReservation,
  validateGuest,
  validateSearch,
  isValidEmail
};
