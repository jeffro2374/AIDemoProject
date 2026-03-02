// Hotel card component

import { formatRating, formatAmenity } from '../utils/formatters.js';
import { router } from '../router.js';

export function renderHotelCard(hotel) {
  return `
    <div class="hotel-card" data-hotel-id="${hotel.id}">
      <div class="hotel-image">🏨</div>
      <div class="hotel-info">
        <h3 class="hotel-name">${hotel.name}</h3>
        <p class="hotel-location">${hotel.location}</p>
        <p class="hotel-rating">${formatRating(hotel.rating)}</p>
        <div class="hotel-amenities">
          ${hotel.amenities.slice(0, 3).map(a => `<span class="amenity-tag">${formatAmenity(a)}</span>`).join('')}
        </div>
        <button class="btn btn-primary view-hotel-btn">View Rooms</button>
      </div>
    </div>
  `;
}

export function renderHotelsList(hotels) {
  if (hotels.length === 0) {
    return `
      <div class="empty-state">
        <h3>No hotels found</h3>
        <p>Try adjusting your search criteria</p>
      </div>
    `;
  }

  return `
    <div class="hotels-grid">
      ${hotels.map(hotel => renderHotelCard(hotel)).join('')}
    </div>
  `;
}

export function attachHotelCardHandlers(searchParams) {
  document.querySelectorAll('.view-hotel-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.hotel-card');
      const hotelId = card.dataset.hotelId;
      const params = new URLSearchParams(searchParams).toString();
      router.navigate(`/hotel/${hotelId}${params ? `?${params}` : ''}`);
    });
  });
}
