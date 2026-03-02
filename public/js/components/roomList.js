// Room list component

import { formatCurrency, formatRoomType } from '../utils/formatters.js';
import { router } from '../router.js';

export function renderRoomsList(rooms, searchParams = {}) {
  if (rooms.length === 0) {
    return `<div class="empty-state"><h3>No rooms available</h3></div>`;
  }

  return `
    <div class="rooms-list">
      ${rooms.map(room => renderRoomCard(room)).join('')}
    </div>
  `;
}

function renderRoomCard(room) {
  return `
    <div class="room-card" data-room-id="${room.id}">
      <div class="room-info">
        <h3>${formatRoomType(room.type)} Room</h3>
        <p class="room-details">Up to ${room.capacity} guests</p>
      </div>
      <div class="room-pricing">
        <p class="room-price">${formatCurrency(room.price)} <span>/ night</span></p>
        <button class="btn btn-primary book-room-btn">Book Now</button>
      </div>
    </div>
  `;
}

export function attachRoomListHandlers(searchParams) {
  document.querySelectorAll('.book-room-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.room-card');
      const roomId = card.dataset.roomId;
      const params = new URLSearchParams(searchParams).toString();
      router.navigate(`/book/${roomId}${params ? `?${params}` : ''}`);
    });
  });
}
