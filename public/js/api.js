// API client for hotel reservation system

const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Helper to filter out undefined/null values from params
function cleanParams(params) {
  const cleaned = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Hotels API
export const hotelsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(cleanParams(params)).toString();
    return fetchApi(`/hotels${query ? `?${query}` : ''}`);
  },

  getById: (id) => {
    return fetchApi(`/hotels/${id}`);
  },

  getRooms: (hotelId) => {
    return fetchApi(`/hotels/${hotelId}/rooms`);
  }
};

// Rooms API
export const roomsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(cleanParams(params)).toString();
    return fetchApi(`/rooms${query ? `?${query}` : ''}`);
  },

  getById: (id) => {
    return fetchApi(`/rooms/${id}`);
  },

  checkAvailability: (roomId, checkIn, checkOut) => {
    const params = new URLSearchParams({ checkIn, checkOut });
    return fetchApi(`/rooms/${roomId}/availability?${params}`);
  }
};

// Reservations API
export const reservationsApi = {
  getAll: (guestId = null) => {
    const query = guestId ? `?guestId=${guestId}` : '';
    return fetchApi(`/reservations${query}`);
  },

  getById: (id) => {
    return fetchApi(`/reservations/${id}`);
  },

  create: (data) => {
    return fetchApi('/reservations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: (id, data) => {
    return fetchApi(`/reservations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  cancel: (id) => {
    return fetchApi(`/reservations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' })
    });
  },

  delete: (id) => {
    return fetchApi(`/reservations/${id}`, {
      method: 'DELETE'
    });
  }
};

// Guests API
export const guestsApi = {
  getAll: () => {
    return fetchApi('/guests');
  },

  getById: (id) => {
    return fetchApi(`/guests/${id}`);
  },

  create: (data) => {
    return fetchApi('/guests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: (id, data) => {
    return fetchApi(`/guests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  lookup: (email, firstName = null, lastName = null) => {
    return fetchApi('/guests/lookup', {
      method: 'POST',
      body: JSON.stringify({ email, firstName, lastName })
    });
  }
};
