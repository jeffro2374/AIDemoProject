const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const { validateReservation } = require('../middleware/validation');
const { validateDateRange, dateRangesOverlap } = require('../utils/dateUtils');
const { calculateTotalPrice, applyDiscount } = require('../utils/pricing');

/**
 * GET /api/reservations
 * Get all reservations (optionally filtered by guest)
 */
router.get('/', (req, res) => {
  const { guestId } = req.query;
  let results = [...store.reservations];

  if (guestId) {
    results = results.filter(r => r.guestId === guestId);
  }

  // Enrich with room and hotel info
  results = results.map(enrichReservation);

  res.json(results);
});

/**
 * GET /api/reservations/:id
 * Get a specific reservation
 */
router.get('/:id', (req, res) => {
  const reservation = store.findReservationById(req.params.id);

  if (!reservation) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  res.json(enrichReservation(reservation));
});

/**
 * POST /api/reservations
 * Create a new reservation
 */
router.post('/', validateReservation, (req, res) => {
  const { roomId, guestId, checkIn, checkOut, discountCode, specialRequests } = req.body;

  // Validate room exists
  const room = store.findRoomById(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Validate guest exists
  const guest = store.findGuestById(guestId);
  if (!guest) {
    return res.status(404).json({ error: 'Guest not found' });
  }

  // Validate date range
  const dateValidation = validateDateRange(checkIn, checkOut);
  if (!dateValidation.valid) {
    return res.status(400).json({ error: dateValidation.error });
  }

  // Check availability
  const conflicting = store.reservations.filter(r =>
    r.roomId === roomId &&
    r.status !== 'cancelled' &&
    dateRangesOverlap(checkIn, checkOut, r.checkIn, r.checkOut)
  );

  if (conflicting.length > 0) {
    return res.status(409).json({ error: 'Room is not available for the selected dates' });
  }

  // Calculate pricing
  let pricing = calculateTotalPrice(room.price, checkIn, checkOut);

  // Apply discount if provided
  if (discountCode) {
    const discountResult = applyDiscount(pricing.total, discountCode);
    if (discountResult.valid) {
      pricing.discount = discountResult.discount;
      pricing.discountCode = discountCode;
      pricing.total = discountResult.total;
    }
  }

  // Create reservation
  const reservation = {
    id: uuidv4(),
    roomId,
    guestId,
    checkIn,
    checkOut,
    pricing,
    specialRequests: specialRequests || '',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  store.reservations.push(reservation);

  res.status(201).json(enrichReservation(reservation));
});

/**
 * PATCH /api/reservations/:id
 * Update a reservation (change dates or cancel)
 */
router.patch('/:id', (req, res) => {
  const reservationIndex = store.reservations.findIndex(r => r.id === req.params.id);

  if (reservationIndex === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  const reservation = store.reservations[reservationIndex];
  const { status, checkIn, checkOut, specialRequests } = req.body;

  // Handle cancellation
  if (status === 'cancelled') {
    reservation.status = 'cancelled';
    reservation.cancelledAt = new Date().toISOString();
    return res.json(enrichReservation(reservation));
  }

  // Handle date changes
  if (checkIn || checkOut) {
    const newCheckIn = checkIn || reservation.checkIn;
    const newCheckOut = checkOut || reservation.checkOut;

    const dateValidation = validateDateRange(newCheckIn, newCheckOut);
    if (!dateValidation.valid) {
      return res.status(400).json({ error: dateValidation.error });
    }

    // Check availability (excluding current reservation)
    const conflicting = store.reservations.filter(r =>
      r.id !== reservation.id &&
      r.roomId === reservation.roomId &&
      r.status !== 'cancelled' &&
      dateRangesOverlap(newCheckIn, newCheckOut, r.checkIn, r.checkOut)
    );

    if (conflicting.length > 0) {
      return res.status(409).json({ error: 'Room is not available for the new dates' });
    }

    reservation.checkIn = newCheckIn;
    reservation.checkOut = newCheckOut;

    // Recalculate pricing
    const room = store.findRoomById(reservation.roomId);
    reservation.pricing = calculateTotalPrice(room.price, newCheckIn, newCheckOut);
  }

  if (specialRequests !== undefined) {
    reservation.specialRequests = specialRequests;
  }

  reservation.updatedAt = new Date().toISOString();

  res.json(enrichReservation(reservation));
});

/**
 * DELETE /api/reservations/:id
 * Delete a reservation
 */
router.delete('/:id', (req, res) => {
  const index = store.reservations.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  store.reservations.splice(index, 1);
  res.status(204).send();
});

/**
 * Enrich reservation with room and hotel details
 */
function enrichReservation(reservation) {
  const room = store.findRoomById(reservation.roomId);
  const hotel = room ? store.findHotelById(room.hotelId) : null;
  const guest = store.findGuestById(reservation.guestId);

  return {
    ...reservation,
    room: room ? { type: room.type, price: room.price } : null,
    hotel: hotel ? { name: hotel.name, location: hotel.location } : null,
    guest: guest ? { firstName: guest.firstName, lastName: guest.lastName, email: guest.email } : null
  };
}

module.exports = router;
