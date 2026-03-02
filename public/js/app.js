// Main application entry point

import { router } from './router.js';
import { hotelsApi, roomsApi, reservationsApi, guestsApi } from './api.js';
import { renderHeader } from './components/header.js';
import { renderSearchForm, attachSearchFormHandlers } from './components/searchForm.js';
import { renderHotelsList, attachHotelCardHandlers } from './components/hotelCard.js';
import { renderRoomsList, attachRoomListHandlers } from './components/roomList.js';
import { renderBookingForm, attachBookingFormHandlers } from './components/bookingForm.js';
import { renderReservationsList, attachReservationHandlers } from './components/reservationList.js';
import { getTodayForInput, getTomorrowForInput } from './utils/dateUtils.js';

// Get default search params
function getDefaultSearchParams() {
  return {
    checkIn: getTodayForInput(),
    checkOut: getTomorrowForInput(),
    guests: 2
  };
}

// App state
let state = {
  hotels: [],
  currentHotel: null,
  searchParams: {},
  guestId: localStorage.getItem('guestId') || null
};

// Initialize app
function init() {
  renderHeader();
  setupRoutes();
  router.handleRoute();
}

// Setup routes
function setupRoutes() {
  router.addRoute('/', handleHomePage);
  router.addRoute('/hotel/:id', handleHotelPage);
  router.addRoute('/book/:roomId', handleBookingPage);
  router.addRoute('/reservations', handleReservationsPage);
  router.addRoute('/confirmation/:id', handleConfirmationPage);
}

// Page handlers
async function handleHomePage(params) {
  const main = document.getElementById('main-content');
  // Merge with defaults so we always have dates
  state.searchParams = { ...getDefaultSearchParams(), ...params };

  main.innerHTML = renderSearchForm(handleSearch, state.searchParams) + '<div id="results"><div class="loading"><div class="spinner"></div>Loading hotels...</div></div>';
  attachSearchFormHandlers(handleSearch);

  try {
    state.hotels = await hotelsApi.getAll({ location: params.location });
    document.getElementById('results').innerHTML = renderHotelsList(state.hotels);
    attachHotelCardHandlers(state.searchParams);
  } catch (error) {
    document.getElementById('results').innerHTML = `<div class="message message-error">Error loading hotels: ${error.message}</div>`;
  }
}

async function handleHotelPage(params) {
  const main = document.getElementById('main-content');
  // Ensure we always have dates
  state.searchParams = { ...getDefaultSearchParams(), ...state.searchParams, ...params };

  main.innerHTML = '<div class="loading"><div class="spinner"></div>Loading hotel...</div>';

  try {
    const hotel = await hotelsApi.getById(params.id);
    state.currentHotel = hotel;

    main.innerHTML = `
      <section class="booking-section">
        <h2>${hotel.name}</h2>
        <p>${hotel.location}</p>
        <h3>Available Rooms</h3>
        ${renderRoomsList(hotel.rooms || [])}
      </section>
    `;
    attachRoomListHandlers(state.searchParams);
  } catch (error) {
    main.innerHTML = `<div class="message message-error">Error: ${error.message}</div>`;
  }
}

async function handleBookingPage(params) {
  const main = document.getElementById('main-content');
  // Ensure we always have dates
  state.searchParams = { ...getDefaultSearchParams(), ...state.searchParams, ...params };

  main.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

  try {
    const room = await roomsApi.getById(params.roomId);
    const hotel = await hotelsApi.getById(room.hotelId);
    const availability = await roomsApi.checkAvailability(
      params.roomId,
      state.searchParams.checkIn,
      state.searchParams.checkOut
    );

    if (!availability.available) {
      main.innerHTML = `<div class="message message-error">Room not available for selected dates</div>`;
      return;
    }

    main.innerHTML = renderBookingForm(room, hotel, availability.pricing, state.searchParams);
    attachBookingFormHandlers(params.roomId, state.searchParams, handleBookingSubmit);
  } catch (error) {
    main.innerHTML = `<div class="message message-error">Error: ${error.message}</div>`;
  }
}

async function handleReservationsPage() {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="loading"><div class="spinner"></div>Loading reservations...</div>';

  try {
    const reservations = state.guestId
      ? await reservationsApi.getAll(state.guestId)
      : [];

    main.innerHTML = `
      <section class="booking-section">
        <h2>My Reservations</h2>
        ${renderReservationsList(reservations)}
      </section>
    `;
    attachReservationHandlers(handleCancelReservation);
  } catch (error) {
    main.innerHTML = `<div class="message message-error">Error: ${error.message}</div>`;
  }
}

async function handleConfirmationPage(params) {
  const main = document.getElementById('main-content');

  try {
    const reservation = await reservationsApi.getById(params.id);
    main.innerHTML = `
      <section class="booking-section">
        <div class="message message-success">
          <h2>Booking Confirmed!</h2>
          <p>Reservation ID: ${reservation.id}</p>
          <p>Check your email for details.</p>
        </div>
        <button class="btn btn-primary" onclick="window.location='/'">Back to Home</button>
      </section>
    `;
  } catch (error) {
    main.innerHTML = `<div class="message message-error">Error: ${error.message}</div>`;
  }
}

// Event handlers
function handleSearch(params) {
  state.searchParams = params;
  const query = new URLSearchParams(params).toString();
  router.navigate(`/?${query}`);
}

async function handleBookingSubmit(bookingData) {
  const main = document.getElementById('main-content');

  try {
    // Find or create guest
    const guestResult = await guestsApi.lookup(
      bookingData.email,
      bookingData.firstName,
      bookingData.lastName
    );

    const guestId = guestResult.guest.id;
    state.guestId = guestId;
    localStorage.setItem('guestId', guestId);

    // Create reservation
    const reservation = await reservationsApi.create({
      roomId: bookingData.roomId,
      guestId: guestId,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      discountCode: bookingData.discountCode
    });

    router.navigate(`/confirmation/${reservation.id}`);
  } catch (error) {
    main.innerHTML += `<div class="message message-error">Booking failed: ${error.message}</div>`;
  }
}

async function handleCancelReservation(reservationId) {
  try {
    await reservationsApi.cancel(reservationId);
    handleReservationsPage();
  } catch (error) {
    alert(`Failed to cancel: ${error.message}`);
  }
}

// Start the app
init();
