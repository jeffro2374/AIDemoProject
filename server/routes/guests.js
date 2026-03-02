const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const { validateGuest } = require('../middleware/validation');

/**
 * GET /api/guests
 * Get all guests
 */
router.get('/', (req, res) => {
  // Return guests without sensitive info
  const guests = store.guests.map(g => ({
    id: g.id,
    firstName: g.firstName,
    lastName: g.lastName,
    email: g.email,
    createdAt: g.createdAt
  }));

  res.json(guests);
});

/**
 * GET /api/guests/:id
 * Get a specific guest by ID
 */
router.get('/:id', (req, res) => {
  const guest = store.findGuestById(req.params.id);

  if (!guest) {
    return res.status(404).json({ error: 'Guest not found' });
  }

  // Include their reservations
  const reservations = store.getReservationsByGuest(guest.id);

  res.json({
    ...guest,
    reservations: reservations.map(r => ({
      id: r.id,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      status: r.status
    }))
  });
});

/**
 * POST /api/guests
 * Register a new guest
 */
router.post('/', validateGuest, (req, res) => {
  const { firstName, lastName, email, phone } = req.body;

  // Check if email already exists
  const existing = store.findGuestByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered', guestId: existing.id });
  }

  const guest = {
    id: uuidv4(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone || null,
    createdAt: new Date().toISOString()
  };

  store.guests.push(guest);

  res.status(201).json(guest);
});

/**
 * PATCH /api/guests/:id
 * Update guest information
 */
router.patch('/:id', (req, res) => {
  const guestIndex = store.guests.findIndex(g => g.id === req.params.id);

  if (guestIndex === -1) {
    return res.status(404).json({ error: 'Guest not found' });
  }

  const guest = store.guests[guestIndex];
  const { firstName, lastName, phone } = req.body;

  if (firstName) {
    guest.firstName = firstName.trim();
  }

  if (lastName) {
    guest.lastName = lastName.trim();
  }

  if (phone !== undefined) {
    guest.phone = phone;
  }

  guest.updatedAt = new Date().toISOString();

  res.json(guest);
});

/**
 * POST /api/guests/lookup
 * Find or create a guest by email
 */
router.post('/lookup', (req, res) => {
  const { email, firstName, lastName } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Try to find existing guest
  let guest = store.findGuestByEmail(email.toLowerCase().trim());

  if (guest) {
    return res.json({ guest, existing: true });
  }

  // Create new guest if name provided
  if (firstName && lastName) {
    guest = {
      id: uuidv4(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: null,
      createdAt: new Date().toISOString()
    };

    store.guests.push(guest);
    return res.status(201).json({ guest, existing: false });
  }

  res.status(404).json({ error: 'Guest not found', needsRegistration: true });
});

module.exports = router;
