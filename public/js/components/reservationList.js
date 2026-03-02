// Reservation list component

import { formatCurrency, formatRoomType, shortenId } from '../utils/formatters.js';
import { formatDate } from '../utils/dateUtils.js';

export function renderReservationsList(reservations) {
  if (reservations.length === 0) {
    return `
      <div class="empty-state">
        <h3>No reservations yet</h3>
        <p>Book a room to see your reservations here</p>
      </div>
    `;
  }

  return `
    <div class="reservations-list">
      ${reservations.map(r => renderReservationCard(r)).join('')}
    </div>
  `;
}

function renderReservationCard(reservation) {
  const statusClass = reservation.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled';

  return `
    <div class="reservation-card" data-reservation-id="${reservation.id}">
      <div class="reservation-header">
        <span class="reservation-id">Booking #${shortenId(reservation.id)}</span>
        <span class="status-badge ${statusClass}">${reservation.status}</span>
      </div>
      <div class="reservation-details">
        <div>
          <strong>${reservation.hotel?.name || 'Hotel'}</strong>
          <p>${formatRoomType(reservation.room?.type || 'standard')}</p>
        </div>
        <div>
          <strong>Check-in</strong>
          <p>${formatDate(reservation.checkIn)}</p>
        </div>
        <div>
          <strong>Check-out</strong>
          <p>${formatDate(reservation.checkOut)}</p>
        </div>
        <div>
          <strong>Total</strong>
          <p>${formatCurrency(reservation.pricing?.total || 0)}</p>
        </div>
      </div>
      ${reservation.status === 'confirmed' ? `
        <button class="btn btn-danger cancel-btn" data-id="${reservation.id}">Cancel</button>
      ` : ''}
    </div>
  `;
}

export function attachReservationHandlers(onCancel) {
  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (confirm('Are you sure you want to cancel this reservation?')) {
        onCancel(id);
      }
    });
  });
}
