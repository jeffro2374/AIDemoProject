const express = require('express');
const cors = require('cors');
const path = require('path');

const hotelsRouter = require('./routes/hotels');
const roomsRouter = require('./routes/rooms');
const reservationsRouter = require('./routes/reservations');
const guestsRouter = require('./routes/guests');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/hotels', hotelsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/guests', guestsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Hotel Reservation Server running on http://localhost:${PORT}`);
});

module.exports = app;
