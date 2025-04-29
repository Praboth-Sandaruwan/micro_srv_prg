// src/pages/dashboards/RestaurantDashboard.jsx
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  Typography, 
  Button, 
  Spinner,
  IconButton,
  Tooltip
} from '@material-tailwind/react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRestaurants = async () => {
      try {
        setLoading(true);
        const response = await api.get('/restaurants/user/me');
        setRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        showToast.error(error.response?.data?.message || 'Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchMyRestaurants();
  }, []);

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) return;
    
    try {
      await api.delete(`/restaurants/${id}`);
      setRestaurants(restaurants.filter(restaurant => restaurant._id !== id));
      showToast.success('Restaurant deleted successfully');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      showToast.error(error.response?.data?.message || 'Failed to delete restaurant');
    }
  };

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
          <Typography variant="h3">Welcome, {user?.name}</Typography>
          <Typography variant="paragraph" color="blue-gray" style={{ marginTop: '0.5rem' }}>
            Manage your restaurants
          </Typography>
        </div>
        <Link to="/restaurant/register">
          <Button style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            fontWeight: '500',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
          }}>
            Register New Restaurant
          </Button>
        </Link>
      </div>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Spinner style={{ height: '3rem', width: '3rem', color: '#3b82f6' }} />
        </div>
      ) : restaurants.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '3rem' }}>
            <Typography variant="h5" color="blue-gray" style={{ marginBottom: '1rem' }}>
              No Restaurants Found
            </Typography>
            <Typography variant="paragraph" color="gray">
              You haven't registered any restaurants yet. Click "Register New Restaurant" to get started.
            </Typography>
            <Link to="/restaurant/register" style={{ textDecoration: 'none' }}>
              <Button 
                color="blue" 
                variant="gradient" 
                style={{ marginTop: '1rem' }}
              >
                Register First Restaurant
              </Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <Typography variant="h5" color="blue-gray" style={{ marginBottom: '1.5rem' }}>
              Your Restaurants
            </Typography>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                minWidth: '600px'
              }}>
                <thead>
                  <tr>
                    <th style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#64748b',
                      fontWeight: '600',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}>Name</th>
                    <th style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#64748b',
                      fontWeight: '600',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}>Address</th>
                    <th style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#64748b',
                      fontWeight: '600',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}>Status</th>
                    <th style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#64748b',
                      fontWeight: '600',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}>Open</th>
                    <th style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#64748b',
                      fontWeight: '600',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant._id}>
                      <td style={{ 
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <Typography variant="small" color="blue-gray">
                          {restaurant.name}
                        </Typography>
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <Typography variant="small" color="blue-gray">
                          {restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state}
                        </Typography>
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          backgroundColor: restaurant.isVerified ? '#dcfce7' : '#fee2e2',
                          color: restaurant.isVerified ? '#166534' : '#991b1b',
                          borderRadius: '9999px',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          display: 'inline-block',
                          textTransform: 'capitalize'
                        }}>
                          {restaurant.isVerified ? 'Verified' : 'Pending'}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          backgroundColor: restaurant.isOpen ? '#dcfce7' : '#fee2e2',
                          color: restaurant.isOpen ? '#166534' : '#991b1b',
                          borderRadius: '9999px',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          display: 'inline-block',
                          textTransform: 'capitalize'
                        }}>
                          {restaurant.isOpen ? 'Open' : 'Closed'}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        whiteSpace: 'nowrap'
                      }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Tooltip content="Edit Restaurant">
                            <Link to={`/restaurant/edit/${restaurant._id}`}>
                              <IconButton
                                variant="text"
                                color="blue"
                                size="sm"
                              >
                                <PencilIcon style={{ width: '16px', height: '16px' }} />
                              </IconButton>
                            </Link>
                          </Tooltip>
                          <Tooltip content="Delete Restaurant">
                            <IconButton
                              variant="text"
                              color="red"
                              size="sm"
                              onClick={() => handleDeleteRestaurant(restaurant._id)}
                            >
                              <TrashIcon style={{ width: '16px', height: '16px' }} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <Card>
          <CardBody>
            <Typography variant="h5" color="blue-gray" style={{ marginBottom: '1rem' }}>
              Menu Management
            </Typography>
            <Typography variant="paragraph" color="gray" style={{ marginBottom: '1.5rem' }}>
              View and manage menu items for your restaurants.
            </Typography>
            <Link to="/restaurant/menu">
              <Button color="blue" variant="gradient">
                Go to Menu Management
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantDashboard;