// Search form component

import { getTodayForInput, getTomorrowForInput } from '../utils/dateUtils.js';

// Available locations (matching hotel data)
const LOCATIONS = [
  { value: '', label: 'All Locations' },
  { value: 'New York', label: 'New York, NY' },
  { value: 'Miami', label: 'Miami, FL' },
  { value: 'Denver', label: 'Denver, CO' }
];

export function renderSearchForm(onSearch, initialValues = {}) {
  const checkIn = initialValues.checkIn || getTodayForInput();
  const checkOut = initialValues.checkOut || getTomorrowForInput();
  const guests = initialValues.guests || 2;
  const location = initialValues.location || '';

  const locationOptions = LOCATIONS.map(loc =>
    `<option value="${loc.value}" ${location === loc.value ? 'selected' : ''}>${loc.label}</option>`
  ).join('');

  return `
    <section class="search-section">
      <h2>Find Your Perfect Stay</h2>
      <form class="search-form" id="search-form">
        <div class="form-group">
          <label for="location">Location</label>
          <select id="location" name="location">
            ${locationOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="check-in">Check-in</label>
          <input
            type="date"
            id="check-in"
            name="checkIn"
            value="${checkIn}"
            min="${getTodayForInput()}"
            required
          >
        </div>
        <div class="form-group">
          <label for="check-out">Check-out</label>
          <input
            type="date"
            id="check-out"
            name="checkOut"
            value="${checkOut}"
            min="${getTodayForInput()}"
            required
          >
        </div>
        <div class="form-group">
          <label for="guests">Guests</label>
          <select id="guests" name="guests">
            <option value="1" ${guests === 1 ? 'selected' : ''}>1 Guest</option>
            <option value="2" ${guests === 2 ? 'selected' : ''}>2 Guests</option>
            <option value="3" ${guests === 3 ? 'selected' : ''}>3 Guests</option>
            <option value="4" ${guests === 4 ? 'selected' : ''}>4 Guests</option>
          </select>
        </div>
        <div class="form-group">
          <button type="submit" class="btn btn-primary">Search</button>
        </div>
      </form>
    </section>
  `;
}

export function attachSearchFormHandlers(onSearch) {
  const form = document.getElementById('search-form');
  if (!form) return;

  // Update check-out min date when check-in changes
  const checkInInput = document.getElementById('check-in');
  const checkOutInput = document.getElementById('check-out');

  checkInInput.addEventListener('change', () => {
    checkOutInput.min = checkInInput.value;
    if (checkOutInput.value <= checkInInput.value) {
      const nextDay = new Date(checkInInput.value);
      nextDay.setDate(nextDay.getDate() + 1);
      checkOutInput.value = nextDay.toISOString().split('T')[0];
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const searchParams = {
      location: formData.get('location'),
      checkIn: formData.get('checkIn'),
      checkOut: formData.get('checkOut'),
      guests: parseInt(formData.get('guests'))
    };
    onSearch(searchParams);
  });
}
