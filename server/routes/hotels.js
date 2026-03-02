const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { validateSearch } = require('../middleware/validation');

/**
 * GET /api/hotels
 * Get all hotels, optionally filtered by location
 */
router.get('/', validateSearch, (req, res) => {
  const { location, rating } = req.query;
  let results = [...store.hotels];

  if (location) {
    results = results.filter(h =>
      h.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (rating) {
    const minRating = parseFloat(rating);
    results = results.filter(h => h.rating >= minRating);
  }

  res.json(results);
});

/**
 * GET /api/hotels/:id
 * Get a specific hotel by ID
 */
router.get('/:id', (req, res) => {
  const hotel = store.findHotelById(req.params.id);

  if (!hotel) {
    return res.status(404).json({ error: 'Hotel not found' });
  }

  // Include rooms with the hotel details
  const rooms = store.getRoomsByHotel(hotel.id);

  res.json({ ...hotel, rooms });
});

/**
 * GET /api/hotels/:id/rooms
 * Get all rooms for a specific hotel
 */
router.get('/:id/rooms', (req, res) => {
  const hotel = store.findHotelById(req.params.id);

  if (!hotel) {
    return res.status(404).json({ error: 'Hotel not found' });
  }

  const rooms = store.getRoomsByHotel(hotel.id);
  res.json(rooms);
});

module.exports = router;
