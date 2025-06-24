const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  async request(endpoint, method = 'GET', body = null) {
    // Ensure window is available (client-side only)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Ensure endpoint doesn't start with slash if BASE_URL ends with one
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    const response = await fetch(`${BASE_URL}/${normalizedEndpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return await response.json();
  },

  // Auth endpoints
  login: (credentials) => api.request('auth/login', 'POST', credentials),
  register: (userData) => api.request('auth/signup', 'POST', userData),
  getMe: () => api.request('auth/me'),

  // Chat endpoints
  getRooms: () => api.request('chat/rooms'),
  // createRoom: (data) => api.request('chat/rooms', 'POST', data),
  getMessages: (roomId) => api.request(`chat/messages/${roomId}`),
  // sendMessage: (roomId, content) => api.request('chat/messages', 'POST', { roomId, content }),

  //User endpoints
  getUserIdsByUsernames: (usernames) => api.request('users/lookup', 'POST', { usernames }),
};