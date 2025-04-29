// src/pages/admin/PendingRestaurants.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Tooltip
} from '@material-tailwind/react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const PendingRestaurants = () => {
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRestaurants();
  }, []);

  const fetchPendingRestaurants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/restaurants/pending/all');
      setPendingRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching pending restaurants:', error);
      showToast.error('Failed to load pending restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRestaurant = async (id) => {
    try {
      await api.put(`/restaurants/${id}/verify`);
      showToast.success('Restaurant verified successfully');
      // Refresh the list
      fetchPendingRestaurants();
    } catch (error) {
      console.error('Error verifying restaurant:', error);
      showToast.error('Failed to verify restaurant');
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
        <Typography variant="h3">Pending Restaurant Approvals</Typography>
        <Link to="/admin/restaurants">
          <Button color="blue">View All Restaurants</Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader
          floated={false}
          shadow={false}
          style={{ 
            padding: '1.5rem',
            backgroundColor: '#f8fafc'
          }}
        >
          <Typography variant="h5" color="blue-gray">
            {pendingRestaurants.length > 0 
              ? `${pendingRestaurants.length} pending approval${pendingRestaurants.length > 1 ? 's' : ''}` 
              : 'No pending approvals'}
          </Typography>
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
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Contact</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Location</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Submitted</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRestaurants.length > 0 ? (
                  pendingRestaurants.map((restaurant) => (
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
                          {restaurant.contactNumber}
                        </Typography>
                        <Typography variant="small" color="gray">
                          {restaurant.email}
                        </Typography>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Typography variant="paragraph" color="blue-gray">
                          {restaurant.address.city}, {restaurant.address.state}
                        </Typography>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Typography variant="paragraph" color="blue-gray">
                          {new Date(restaurant.createdAt).toLocaleDateString()}
                        </Typography>
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}>
                        <Tooltip content="View Details">
                          <Link to={`/admin/restaurants/edit/${restaurant._id}`}>
                            <Button 
                              size="sm" 
                              variant="outlined"
                              color="blue"
                            >
                              Details
                            </Button>
                          </Link>
                        </Tooltip>
                        <Tooltip content="Approve Restaurant">
                          <Button 
                            size="sm" 
                            color="green"
                            onClick={() => handleVerifyRestaurant(restaurant._id)}
                          >
                            Verify
                          </Button>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>
                      <Typography variant="paragraph" color="blue-gray">
                        No pending restaurant registrations
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

export default PendingRestaurants;