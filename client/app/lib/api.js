import { BASE_URL } from "./constants";
export const api = {
  async request(endpoint, method = 'GET', body = null) {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

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
  getMessages: (roomId) => api.request(`chat/messages/${roomId}`),

  //User endpoints
  getUserIdsByUsernames: (usernames) => api.request('users/lookup', 'POST', { usernames }),
};