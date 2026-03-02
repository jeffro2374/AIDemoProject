// Booking form component

import { formatCurrency, formatRoomType } from '../utils/formatters.js';
import { formatDate } from '../utils/dateUtils.js';

export function renderBookingForm(room, hotel, pricing, searchParams) {
  return `
    <section class="booking-section">
      <h2>Complete Your Booking</h2>
      <div class="booking-details">
        <h3>${hotel.name} - ${formatRoomType(room.type)}</h3>
        <p>${hotel.location}</p>
        <p>${formatDate(searchParams.checkIn)} to ${formatDate(searchParams.checkOut)}</p>
      </div>

      <form class="booking-form" id="booking-form">
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" name="firstName" required>
        </div>
        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" name="lastName" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="discountCode">Discount Code (optional)</label>
          <input type="text" id="discountCode" name="discountCode" placeholder="e.g., SAVE10">
        </div>

        <div class="booking-summary">
          <div class="summary-row">
            <span>${pricing.nights} night(s) x ${formatCurrency(pricing.pricePerNight)}</span>
            <span>${formatCurrency(pricing.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>Taxes & Fees</span>
            <span>${formatCurrency(pricing.taxes + pricing.fees)}</span>
          </div>
          <div class="summary-row">
            <span>Total</span>
            <span>${formatCurrency(pricing.total)}</span>
          </div>
        </div>

        <button type="submit" class="btn btn-primary">Confirm Booking</button>
      </form>
    </section>
  `;
}

export function attachBookingFormHandlers(roomId, searchParams, onSubmit) {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const bookingData = {
      roomId,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      discountCode: formData.get('discountCode') || null
    };

    onSubmit(bookingData);
  });
}
