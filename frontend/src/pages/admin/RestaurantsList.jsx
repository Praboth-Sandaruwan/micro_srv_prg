// src/pages/admin/RestaurantsList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Tooltip
} from '@material-tailwind/react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const RestaurantsList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    // Filter restaurants based on search query
    if (searchQuery.trim() === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(
        restaurant =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.address.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchQuery, restaurants]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/restaurants');
      setRestaurants(response.data);
      setFilteredRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      showToast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await api.delete(`/restaurants/${id}`);
        showToast.success('Restaurant deleted successfully');
        // Refresh restaurants list
        fetchRestaurants();
      } catch (error) {
        console.error('Error deleting restaurant:', error);
        showToast.error('Failed to delete restaurant');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '70vh' 
      }}>
        <LoadingSpinner size="lg" />
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
        <Typography variant="h3">All Restaurants</Typography>
        <Link to="/admin/pending-restaurants">
          <Button color="blue">View Pending Approvals</Button>
        </Link>
      </div>
      
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader
          floated={false}
          shadow={false}
          style={{ 
            padding: '1.5rem',
            backgroundColor: '#f8fafc'
          }}
        >
          <div style={{ width: '100%', maxWidth: '24rem' }}>
            <Input
              label="Search restaurants"
              icon={<i className="fas fa-search" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardBody style={{ padding: '1rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              minWidth: '800px'
            }}>
              <thead>
                <tr style={{ 
                  borderBottom: '1px solid #e2e8f0', 
                  backgroundColor: '#f8fafc'
                }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Cuisine</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Location</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.length > 0 ? (
                  filteredRestaurants.map((restaurant) => (
                    <tr 
                      key={restaurant._id}
                      style={{ borderBottom: '1px solid #e2e8f0' }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <Typography variant="paragraph" color="blue-gray">
                          {restaurant.name}
                        </Typography>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Typography variant="paragraph" color="blue-gray">
                          {restaurant.cuisine}
                        </Typography>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Typography variant="paragraph" color="blue-gray">
                          {restaurant.address.city}, {restaurant.address.state}
                        </Typography>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          display: 'inline-block',
                          backgroundColor: restaurant.isVerified ? '#dcfce7' : '#fee2e2',
                          color: restaurant.isVerified ? '#166534' : '#b91c1c',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {restaurant.isVerified ? 'Verified' : 'Pending'}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}>
                        <Tooltip content="Edit Restaurant">
                          <Link to={`/admin/restaurants/edit/${restaurant._id}`}>
                            <Button 
                              size="sm" 
                              variant="outlined"
                              color="blue"
                            >
                              Edit
                            </Button>
                          </Link>
                        </Tooltip>
                        <Tooltip content="Delete Restaurant">
                          <Button 
                            size="sm" 
                            color="red"
                            onClick={() => handleDeleteRestaurant(restaurant._id)}
                          >
                            Delete
                          </Button>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>
                      <Typography variant="paragraph" color="blue-gray">
                        No restaurants found
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default RestaurantsList;