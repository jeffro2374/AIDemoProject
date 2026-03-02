// In-memory data store for the hotel reservation system

const hotels = [
  {
    id: 'hotel-1',
    name: 'Grand Plaza Hotel',
    location: 'New York, NY',
    rating: 4.5,
    amenities: ['wifi', 'pool', 'gym', 'restaurant', 'parking']
  },
  {
    id: 'hotel-2',
    name: 'Seaside Resort',
    location: 'Miami, FL',
    rating: 4.8,
    amenities: ['wifi', 'pool', 'beach-access', 'spa', 'restaurant']
  },
  {
    id: 'hotel-3',
    name: 'Mountain Lodge',
    location: 'Denver, CO',
    rating: 4.2,
    amenities: ['wifi', 'fireplace', 'ski-storage', 'restaurant']
  }
];

const rooms = [
  { id: 'room-1', hotelId: 'hotel-1', type: 'standard', price: 150, capacity: 2, available: true },
  { id: 'room-2', hotelId: 'hotel-1', type: 'deluxe', price: 250, capacity: 2, available: true },
  { id: 'room-3', hotelId: 'hotel-1', type: 'suite', price: 400, capacity: 4, available: true },
  { id: 'room-4', hotelId: 'hotel-2', type: 'standard', price: 200, capacity: 2, available: true },
  { id: 'room-5', hotelId: 'hotel-2', type: 'ocean-view', price: 350, capacity: 2, available: true },
  { id: 'room-6', hotelId: 'hotel-2', type: 'penthouse', price: 600, capacity: 4, available: true },
  { id: 'room-7', hotelId: 'hotel-3', type: 'standard', price: 120, capacity: 2, available: true },
  { id: 'room-8', hotelId: 'hotel-3', type: 'cabin', price: 180, capacity: 4, available: true }
];

const reservations = [];

const guests = [];

// Export data and helper functions
module.exports = {
  hotels,
  rooms,
  reservations,
  guests,

  // Helper to find by ID
  findHotelById: (id) => hotels.find(h => h.id === id),
  findRoomById: (id) => rooms.find(r => r.id === id),
  findReservationById: (id) => reservations.find(r => r.id === id),
  findGuestById: (id) => guests.find(g => g.id === id),
  findGuestByEmail: (email) => guests.find(g => g.email === email),

  // Get rooms for a hotel
  getRoomsByHotel: (hotelId) => rooms.filter(r => r.hotelId === hotelId),

  // Get reservations for a guest
  getReservationsByGuest: (guestId) => reservations.filter(r => r.guestId === guestId)
};
