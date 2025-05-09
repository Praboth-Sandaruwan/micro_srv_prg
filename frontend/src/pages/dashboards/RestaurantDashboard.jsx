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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner with Admin Dashboard Colors */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden rounded-b-xl">
        <img 
          src="https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
          alt="Restaurant banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              Welcome, {user?.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-200">
              Manage your culinary empire with ease
            </p>
          </div>
        </div>
      </div>
  
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section with Admin Button Colors */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Restaurant Dashboard</h2>
            
          </div>
          <Link 
  to="/restaurant/register" 
  className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 text-white font-medium rounded-lg shadow-md transition-all duration-300"
  style={{
    background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
    backgroundSize: '200% auto',
    transition: 'all 0.3s ease'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundPosition = 'right center';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundPosition = 'left center';
  }}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
  Register New Restaurant
</Link>
        </div>
  
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : restaurants.length === 0 ? (
          /* Empty State with Admin Card Colors */
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="p-12 text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No restaurants yet</h3>
              <p className="mt-2 text-gray-500">
                Get started by registering your first restaurant.
              </p>
              <div className="mt-6">
                <Link
                  to="/restaurant/register"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium rounded-md shadow-sm transition-all duration-300"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Register Restaurant
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Restaurants Table with Food-App Styling */
          <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
            {/* Table Header with Quick Stats Background Color */}
            <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Your Restaurants ({restaurants.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Hours
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant._id} className="hover:bg-gray-50 transition-colors">
                      {/* Restaurant Info with Food-App Style */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            {restaurant.image ? (
                              <img className="h-full w-full object-cover" src={restaurant.image} alt={restaurant.name} />
                            ) : (
                              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{restaurant.name}</div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <svg className="h-3 w-3 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="font-medium"></span>
                              <span className="mx-1">•</span>
                              <span>{restaurant.cuisine }</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{restaurant.address.street}</div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <svg className="h-3 w-3 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {restaurant.address.city}, {restaurant.address.state}
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${restaurant.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span className="text-sm font-medium text-gray-700">
                            {restaurant.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </td>
                      
                      {/* Hours */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm font-medium text-gray-700">
                            {restaurant.isOpen ? 'Open Now' : 'Closed'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">9:00 AM - 11:00 PM</div>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          
                            <Link 
                              to={`/restaurant/edit/${restaurant._id}`}
                              className="text-blue-600  p-2 rounded-lg  transition-colors"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Link>
                          
                         
                            <button
                              onClick={() => handleDeleteRestaurant(restaurant._id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg  transition-colors"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
  
       
      </div>
    </div>
  );
};

export default RestaurantDashboard;