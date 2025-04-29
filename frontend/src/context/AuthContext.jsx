// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { showToast } from '../components/ui/Toast';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Load user data on initial mount
 // Change this in AuthContext.jsx
useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await authService.isAuthenticated();
        if (isAuth) {
          const userData = await authService.getProfile();
          setUser(userData);
        } else {
          // Not authenticated
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      showToast.success(response.message);
      navigate('/login');
      return true;
    } catch (error) {
      showToast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      const userData = await authService.getProfile();
      setUser(userData);
      showToast.success(response.message);
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'restaurant') {
        navigate('/restaurant/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
      return true;
    } catch (error) {
      showToast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  // Logout user
const logout = async () => {
    try {
      setLoading(true);
      try {
        await authService.logout();
      } catch (error) {
        // Continue with local logout even if API call fails
        console.error('Logout API error:', error);
      }
      // Always clear user state
      setUser(null);
      showToast.success('Successfully logged out');
      navigate('/login');
      return true;
    } catch (error) {
      showToast.error(error.message || 'Error during logout');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Context value
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;