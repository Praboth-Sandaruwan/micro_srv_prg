import axios from 'axios';

// Configure axios instance for cookie-based auth
const api = axios.create({
  baseURL:  'http://localhost:5000/api',
  withCredentials: true, // Essential for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth service methods
export const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Login user - cookies handled automatically
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Check auth status via API call
  isAuthenticated: async () => {
    try {
      await api.get('/auth/profile');
      return true;
    } catch {
      return false;
    }
  }
};

// Request interceptor to handle errors globally
api.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
    response => response,
    error => {
      // Only attempt logout if not already trying to logout
      if (error.response?.status === 401 && !error.config.url.endsWith('/auth/logout')) {
        // Automatic logout if 401 received (but not during logout itself)
        authService.logout(true); // Pass a flag to indicate silent logout
      }
      return Promise.reject(error);
    }
  );

export default authService;