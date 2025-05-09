import axios from 'axios';

// Configure axios instance for cookie-based auth
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Essential for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

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
      // You can import and use authService here if needed
      // Automatic logout if 401 received (but not during logout itself)
      console.log('Unauthorized access detected');
      // Will need to handle this via events or a separate import
    }
    return Promise.reject(error);
  }
);

export default api;