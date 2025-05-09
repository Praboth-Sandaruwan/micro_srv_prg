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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Cuisine
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingRestaurants.length > 0 ? (
                pendingRestaurants.map((restaurant) => (
                  <tr 
                    key={restaurant._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {restaurant.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {restaurant.cuisine}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {restaurant.contactNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {restaurant.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {restaurant.address.city}, {restaurant.address.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(restaurant.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Tooltip content="Approve Restaurant">
                          <Button 
                            size="sm" 
                            color="green"
                            onClick={() => handleVerifyRestaurant(restaurant._id)}
                            className="text-green-600 hover:text-green-800 p-2 rounded-lg transition-colors"
                          >
                            Verify
                          </Button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      No pending restaurant registrations
                    </div>
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