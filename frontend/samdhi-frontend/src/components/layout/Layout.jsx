// src/components/layout/Layout.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register'];
  
  useEffect(() => {
    // Check if user is authenticated or on public route
    const checkAuth = async () => {
      // Wait for authentication check to complete
      if (!loading) {
        const isPublicRoute = publicRoutes.includes(location.pathname);
        
        // If not authenticated and not on public route, redirect to login
        if (!isAuthenticated && !isPublicRoute && location.pathname !== '/') {
          navigate('/login');
        }
        
        // If authenticated and on login/register page, redirect to appropriate dashboard
        if (isAuthenticated && isPublicRoute) {
          if (user?.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (user?.role === 'restaurant') {
            navigate('/restaurant/dashboard');
          } else {
            navigate('/customer/dashboard');
          }
        }
        
        // If on root path, redirect appropriately
        if (location.pathname === '/') {
          if (isAuthenticated) {
            if (user?.role === 'admin') {
              navigate('/admin/dashboard');
            } else if (user?.role === 'restaurant') {
              navigate('/restaurant/dashboard');
            } else {
              navigate('/customer/dashboard');
            }
          } else {
            navigate('/login');
          }
        }
        
        setIsReady(true);
      }
    };
    
    checkAuth();
  }, [isAuthenticated, loading, location.pathname, navigate, user]);
  
  // Show nothing while checking authentication
  if (!isReady) {
    return null;
  }
  
  // Don't show navbar on login and register pages
  const showNavbar = !publicRoutes.includes(location.pathname);
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showNavbar && <Navbar />}
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;