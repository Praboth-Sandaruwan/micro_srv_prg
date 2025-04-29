// src/pages/dashboards/CustomerDashboard.jsx
import { useState, useEffect } from 'react';
import { Card, CardBody, CardFooter, Typography, Button } from '@material-tailwind/react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { showToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to check if restaurant is currently open
  const isRestaurantOpen = (restaurant) => {
    if (!restaurant.isOpen) return false;
    
    try {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      
      // Handle cases where operating hours might not be properly set
      if (!restaurant.operatingHours?.startTime || !restaurant.operatingHours?.endTime) {
        return false;
      }
      
      // Compare time strings directly (works because they're in HH:MM format)
      return restaurant.operatingHours.startTime <= currentTime && 
             restaurant.operatingHours.endTime >= currentTime;
    } catch (error) {
      console.error('Error checking restaurant hours:', error);
      return false; // Default to closed if there's an error
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all restaurants
        const restaurantsResponse = await api.get('/restaurants');
        setRestaurants(restaurantsResponse.data);
      } catch (error) {
        showToast.error('Failed to fetch restaurants');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '1.5rem',
      maxWidth: '1280px',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Typography variant="h4">Welcome, {user?.name}</Typography>
        <Typography variant="small" color="gray" style={{ marginTop: '0.25rem' }}>
          Your customer dashboard
        </Typography>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
        {restaurants.length > 0 ? (
          restaurants.map((restaurant) => {
            const isOpen = isRestaurantOpen(restaurant);
            return (
              <div 
                key={restaurant._id}
                style={{ 
                  cursor: 'pointer',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}
                onClick={() => navigate(`/customer/restaurants/${restaurant._id}/menu`)}
              >
                {/* Image with aspect ratio matching Uber Eats */}
                <div style={{
                  position: 'relative',
                  paddingBottom: '66.66%', // 3:2 aspect ratio
                  backgroundColor: '#f5f5f5'
                }}>
                  <img 
                    src={restaurant.image || '/default-restaurant.jpg'} 
                    alt={restaurant.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = '/default-restaurant.jpg';
                    }}
                  />
                  {!isOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      CLOSED
                    </div>
                  )}
                </div>
  
                {/* Restaurant info - compact Uber Eats style */}
                <div style={{ padding: '0.75rem' }}>
                  <Typography 
                    variant="h6" 
                    style={{ 
                      marginBottom: '0.25rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {restaurant.name}
                  </Typography>
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.25rem',
                    color: '#6b7280',
                    fontSize: '0.8rem'
                  }}>
                    <span style={{ marginRight: '0.5rem' }}>
                    {restaurant.cuisine}
                    </span>
                    
                  </div>
  
                  <Typography 
                    variant="small" 
                    style={{ 
                      color: '#6b7280',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                      {restaurant.address.neighborhood || restaurant.address.city}
                  </Typography>
                </div>
              </div>
            );
          })
        ) : (
          <Typography variant="paragraph" style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '1.5rem',
            fontSize: '0.875rem'
          }}>
            No restaurants found. Check back later!
          </Typography>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;