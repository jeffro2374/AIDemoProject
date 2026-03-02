const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { validateSearch } = require('../middleware/validation');
const { dateRangesOverlap } = require('../utils/dateUtils');
const { calculateTotalPrice } = require('../utils/pricing');

/**
 * GET /api/rooms
 * Get all rooms, optionally filtered
 */
router.get('/', validateSearch, (req, res) => {
  const { hotelId, type, maxPrice, guests, checkIn, checkOut } = req.query;
  let results = [...store.rooms];

  // Filter by hotel
  if (hotelId) {
    results = results.filter(r => r.hotelId === hotelId);
  }

  // Filter by room type
  if (type) {
    results = results.filter(r => r.type === type);
  }

  // Filter by max price
  if (maxPrice) {
    results = results.filter(r => r.price <= parseFloat(maxPrice));
  }

  // Filter by capacity
  if (guests) {
    results = results.filter(r => r.capacity >= parseInt(guests));
  }

  // Filter by availability for date range
  if (checkIn && checkOut) {
    results = results.filter(room => {
      return isRoomAvailable(room.id, checkIn, checkOut);
    });
  }

  // Enrich with hotel info
  results = results.map(room => {
    const hotel = store.findHotelById(room.hotelId);
    return { ...room, hotel: hotel ? { name: hotel.name, location: hotel.location } : null };
  });

  res.json(results);
});

/**
 * GET /api/rooms/:id
 * Get a specific room by ID
 */
router.get('/:id', (req, res) => {
  const room = store.findRoomById(req.params.id);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const hotel = store.findHotelById(room.hotelId);
  res.json({ ...room, hotel });
});

/**
 * GET /api/rooms/:id/availability
 * Check room availability for a date range
 */
router.get('/:id/availability', (req, res) => {
  const { checkIn, checkOut } = req.query;
  const room = store.findRoomById(req.params.id);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (!checkIn || !checkOut) {
    return res.status(400).json({ error: 'Check-in and check-out dates are required' });
  }

  const available = isRoomAvailable(room.id, checkIn, checkOut);
  const pricing = calculateTotalPrice(room.price, checkIn, checkOut);

  res.json({
    roomId: room.id,
    available,
    checkIn,
    checkOut,
    pricing
  });
});

/**
 * Check if a room is available for a date range
 */
function isRoomAvailable(roomId, checkIn, checkOut) {
  const conflictingReservations = store.reservations.filter(r =>
    r.roomId === roomId &&
    r.status !== 'cancelled' &&
    dateRangesOverlap(checkIn, checkOut, r.checkIn, r.checkOut)
  );

  return conflictingReservations.length === 0;
}

module.exports = router;
