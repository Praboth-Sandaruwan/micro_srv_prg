// src/pages/customer/CustomerRestaurants.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Typography, 
  Button, 
  Spinner,
  Badge
} from '@material-tailwind/react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { showToast } from '../../components/ui/Toast';

const CustomerRestaurants = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRestaurants = async () => {
      try {
        setLoading(true);
        const response = await api.get('/restaurants/user/me');
        
        // Check if the response is an array or has restaurants property
        const restaurantsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.restaurants || []);
          
        setRestaurants(restaurantsData);
        
        // If no restaurants, redirect to registration
        if (restaurantsData.length === 0) {
          // We can either redirect automatically or let the user click a button
          // navigate('/customer/register-restaurant');
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        showToast.error(error.response?.data?.message || 'Failed to load restaurants');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRestaurants();
  }, [navigate]);

  const handleAddRestaurant = () => {
    navigate('/customer/register-restaurant');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'amber';
      case 'rejected':
        return 'red';
      default:
        return 'blue-gray';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh' 
      }}>
        <Spinner style={{ height: '3rem', width: '3rem', color: '#3b82f6' }} />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1280px',
      margin: '0 auto'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem' 
      }}>
        <div>
          <Typography variant="h3">My Restaurants</Typography>
          <Typography variant="paragraph" color="blue-gray" style={{ marginTop: '0.5rem' }}>
            Manage your registered restaurants
          </Typography>
        </div>
        <Button 
          color="blue"
          onClick={handleAddRestaurant}
          style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            fontWeight: '500',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
          }}
        >
          Register New Restaurant
        </Button>
      </div>
      
      {/* No Restaurants Case */}
      {restaurants.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '3rem' }}>
            <Typography variant="h5" color="blue-gray" style={{ marginBottom: '1rem' }}>
              No Restaurants Found
            </Typography>
            <Typography variant="paragraph" color="gray">
              You haven't registered any restaurants yet. Click the button below to register your first restaurant.
            </Typography>
            <Button 
              color="blue" 
              variant="gradient" 
              style={{ marginTop: '1rem' }}
              onClick={handleAddRestaurant}
            >
              Register Restaurant
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {restaurants.map((restaurant) => (
            <Card key={restaurant._id} style={{ overflow: 'hidden' }}>
              <div style={{ 
                height: '160px', 
                overflow: 'hidden', 
                position: 'relative',
                backgroundColor: '#e5e7eb'
              }}>
                <img 
                  src={restaurant.image || '/default-restaurant.jpg'} 
                  alt={restaurant.name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                  onError={(e) => {
                    e.target.src = '/default-restaurant.jpg';
                  }}
                />
                <Badge
                  content={restaurant.status || 'pending'}
                  color={getStatusColor(restaurant.status)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    textTransform: 'capitalize'
                  }}
                />
              </div>
              <CardBody style={{ padding: '1rem' }}>
                <Typography variant="h5" color="blue-gray">
                  {restaurant.name}
                </Typography>
                <Typography variant="small" color="gray" style={{ display: 'block', marginTop: '0.25rem' }}>
                  {restaurant.cuisine}
                </Typography>
                <Typography variant="small" color="gray" style={{ display: 'block', marginTop: '0.25rem' }}>
                  {restaurant.address?.city}, {restaurant.address?.state}
                </Typography>
                
                {/* Status message based on approval status */}
                {restaurant.status === 'pending' && (
                  <Typography 
                    variant="small" 
                    color="amber" 
                    style={{ 
                      display: 'block', 
                      marginTop: '0.75rem',
                      fontWeight: '500' 
                    }}
                  >
                    Awaiting admin approval
                  </Typography>
                )}
                
                {restaurant.status === 'rejected' && (
                  <Typography 
                    variant="small" 
                    color="red" 
                    style={{ 
                      display: 'block', 
                      marginTop: '0.75rem',
                      fontWeight: '500' 
                    }}
                  >
                    Rejected: {restaurant.rejectionReason || 'Contact admin for details'}
                  </Typography>
                )}
              </CardBody>
              <CardHeader
                style={{ 
                  padding: '0.75rem 1rem', 
                  backgroundColor: '#f8fafc', 
                  borderTop: '1px solid #e2e8f0',
                  marginTop: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button 
                    color="blue" 
                    size="sm" 
                    variant="text"
                    onClick={() => navigate(`/customer/restaurants/${restaurant._id}/details`)}
                  >
                    View Details
                  </Button>
                  
                  {restaurant.status === 'approved' && (
                    <Button 
                      color="green" 
                      size="sm" 
                      variant="text"
                      onClick={() => navigate(`/customer/restaurants/${restaurant._id}/menu`)}
                    >
                      Manage Menu
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerRestaurants;