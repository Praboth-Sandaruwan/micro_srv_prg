// src/pages/dashboards/AdminDashboard.jsx (updated)
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Typography, Button } from '@material-tailwind/react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRestaurants();
  }, []);

  const fetchPendingRestaurants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/restaurants/pending/all');
      setPendingCount(response.data.length);
    } catch (error) {
      console.error('Error fetching pending restaurants:', error);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1280px',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <Typography variant="h3">Welcome, {user?.name}</Typography>
        <Typography variant="paragraph" color="blue-gray" style={{ marginTop: '0.5rem' }}>
          Admin Dashboard
        </Typography>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Card>
          <CardBody>
            <Typography variant="h5" color="blue-gray" style={{ marginBottom: '0.5rem' }}>
              Pending Restaurants
            </Typography>
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Typography variant="h2" style={{ marginBottom: '1rem' }}>
                  {pendingCount}
                </Typography>
                <Link to="/admin/pending-restaurants">
                  <Button color="blue" fullWidth>
                    {pendingCount > 0 ? 'Review Approvals' : 'View Pending'}
                  </Button>
                </Link>
              </>
            )}
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Typography variant="h5" color="blue-gray" style={{ marginBottom: '0.5rem' }}>
              Restaurant Management
            </Typography>
            <Typography variant="paragraph" style={{ marginBottom: '1.5rem' }}>
              Manage all restaurants in the system
            </Typography>
            <Link to="/admin/restaurants">
              <Button color="blue" fullWidth>
                View Restaurants
              </Button>
            </Link>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Typography variant="h5" color="blue-gray" style={{ marginBottom: '0.5rem' }}>
              User Management
            </Typography>
            <Typography variant="paragraph" style={{ marginBottom: '1.5rem' }}>
              View and manage system users
            </Typography>
            <Link to="/admin/users">
              <Button color="blue" fullWidth>
                Manage Users
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;