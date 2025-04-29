// src/pages/UnauthorizedPage.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Typography } from '@material-tailwind/react';

const UnauthorizedPage = () => {
  const { user } = useAuth();
  
  // Determine where to redirect based on user role
  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'restaurant':
        return '/restaurant/dashboard';
      case 'customer':
        return '/customer/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '1rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <Typography variant="h1" style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '1rem' }}>
          403
        </Typography>
        <Typography variant="h4" style={{ marginBottom: '0.75rem' }}>
          Access Denied
        </Typography>
        <Typography variant="paragraph" style={{ marginBottom: '1.5rem', color: '#64748b' }}>
          You don't have permission to access this page.
        </Typography>
        <Link to={getDashboardLink()}>
          <Button color="blue" variant="gradient">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;