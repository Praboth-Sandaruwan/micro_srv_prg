// src/pages/dashboards/CustomerDashboard.jsx
import { useState, useEffect } from 'react';
import { Card, CardBody, CardFooter, Typography, Button, Input } from '@material-tailwind/react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { showToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

// Sample banner images (replace with your own or fetch from API)
const BANNER_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1682&q=80',
  'https://images.unsplash.com/photo-1432139509613-5c4255815697?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1492&q=80',
  'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80',
  'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80',
  'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1557&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1599&q=80'

];

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const navigate = useNavigate();

  // Rotate banner images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        prevIndex === BANNER_IMAGES.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter restaurants based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.neighborhood?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchQuery, restaurants]);

  // Function to check if restaurant is currently open
  const isRestaurantOpen = (restaurant) => {
    if (!restaurant.isOpen) return false;
    
    try {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      
      if (!restaurant.operatingHours?.startTime || !restaurant.operatingHours?.endTime) {
        return false;
      }
      
      return restaurant.operatingHours.startTime <= currentTime && 
             restaurant.operatingHours.endTime >= currentTime;
    } catch (error) {
      console.error('Error checking restaurant hours:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantsResponse = await api.get('/restaurants');
        setRestaurants(restaurantsResponse.data);
        setFilteredRestaurants(restaurantsResponse.data);
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
      {/* Enhanced Banner Section */}
      <div style={{
        position: 'relative',
        height: '300px',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        {BANNER_IMAGES.map((img, index) => (
          <div 
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: index === currentBannerIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: 1
            }}
          />
        ))}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          color: 'white'
        }}>
          <Typography variant="h2" style={{ 
            fontWeight: '700',
            marginBottom: '1rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            fontSize: '2.5rem'
          }}>
            Discover Amazing Food
          </Typography>
          <Typography variant="lead" style={{ 
            marginBottom: '2rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            textAlign: 'center',
            fontSize: '1.25rem'
          }}>
            Order from your favorite local restaurants
          </Typography>
          
          {/* Enhanced Search Bar */}
          <div style={{ 
            width: '100%',
            maxWidth: '600px',
            position: 'relative',
            zIndex: 3
          }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#6B7280"  // Matching gray color
                style={{
                  position: 'absolute',
                  left: '1rem',
                  height: '1.25rem',
                  width: '1.25rem'
                }}
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <Input
                type="text"
                placeholder="Search restaurants by name, cuisine, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  borderRadius: '9999px',
                  padding: '1rem 1.5rem 1rem 3rem', // Added left padding for icon
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  color: '#374151', // Dark gray text color
                  fontSize: '1rem',
                  width: '100%'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Typography variant="h3" style={{ fontWeight: '600' }}>
          {searchQuery ? `Search Results for "${searchQuery}"` : `Welcome ${user?.name}`}
        </Typography>
        {/* <Typography variant="small" color="gray" style={{ marginTop: '0.25rem' }}>
          {searchQuery ? 
            `${filteredRestaurants.length} ${filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'} found` : 
            'Your customer dashboard'}
        </Typography> */}
      </div>
      
      {/* Restaurants Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '1.25rem',
        marginTop: '1rem'
      }}>
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => {
            const isOpen = isRestaurantOpen(restaurant);
            return (
              <div 
                key={restaurant._id}
                style={{ 
                  cursor: 'pointer',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
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
                  paddingBottom: '66.66%',
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
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px'
          }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ 
                width: '3rem',
                height: '3rem',
                margin: '0 auto 1rem',
                color: '#94a3b8'
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <Typography variant="h6" style={{ marginBottom: '0.5rem' }}>
              No restaurants found
            </Typography>
            <Typography variant="paragraph" style={{ color: '#64748b' }}>
              {searchQuery ? 
                'Try a different search term' : 
                'Check back later for new restaurants in your area'}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;