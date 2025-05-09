import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Typography, 
  Button, 
  Spinner,
  Tooltip
} from '@material-tailwind/react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const MenuManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRestaurants = async () => {
      try {
        setLoading(true);
        const response = await api.get('/menu/my-restaurants');
        setRestaurants(response.data);
        
        // If restaurants exist, select the first one by default
        if (response.data.length > 0) {
          setSelectedRestaurant(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        showToast.error(error.response?.data?.message || 'Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchMyRestaurants();
  }, []);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!selectedRestaurant) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/menu/restaurant/${selectedRestaurant}`);
        setMenuItems(response.data.menuItems);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        showToast.error(error.response?.data?.message || 'Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedRestaurant]);

  const handleRestaurantChange = (restaurantId) => {
    setSelectedRestaurant(restaurantId);
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      setLoading(true);
      await api.delete(`/menu/${itemId}`);
      
      // Refresh the menu items list
      const updatedItems = menuItems.filter(item => item._id !== itemId);
      setMenuItems(updatedItems);
      
      showToast.success('Menu item deleted successfully');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      showToast.error(error.response?.data?.message || 'Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = (restaurantId) => {
    navigate(`/restaurant/menu/add?restaurantId=${restaurantId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Menu Management</h2>
          <p className="text-gray-600 mt-2">
            Manage your restaurant menu items
          </p>
        </div>
        <Link 
  to="/restaurant/menu/add" 
  className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 text-white font-medium rounded-lg shadow-md transition-all duration-300"
  style={{
    background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
    backgroundSize: '200% auto'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundPosition = 'right center';
    e.currentTarget.style.filter = 'brightness(1.05)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundPosition = 'left center';
    e.currentTarget.style.filter = 'brightness(1)';
  }}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
  Add Menu Item
</Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="p-12 text-center">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Restaurants Found</h3>
            <p className="mt-2 text-gray-500">
              You need to register a restaurant before adding menu items.
            </p>
            <button
  onClick={() => navigate('/restaurant/register')}
  className="mt-6 inline-flex items-center px-4 py-2 text-white font-medium rounded-md shadow-sm transition-all duration-300"
  style={{
    background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
    backgroundSize: '200% auto'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundPosition = 'right center';
    e.currentTarget.style.filter = 'brightness(1.05)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundPosition = 'left center';
    e.currentTarget.style.filter = 'brightness(1)';
  }}
>
  Register Restaurant
</button>
          </div>
        </div>
      ) : (
        <>
          {/* Restaurant Selection Card */}
<div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mb-6">
  <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900">Select Restaurant</h3>
  </div>
  <div className="p-6">
    <div className="flex flex-wrap gap-3">
      {restaurants.map((restaurant) => (
        <div key={restaurant._id} className="flex items-center">
          <button
            onClick={() => handleRestaurantChange(restaurant._id)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedRestaurant === restaurant._id 
                ? 'text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            style={selectedRestaurant === restaurant._id ? {
              background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
              backgroundSize: '200% auto',
              transition: 'all 0.3s ease'
            } : {}}
          >
            {restaurant.name}
          </button>
          <button
            onClick={() => handleAddMenuItem(restaurant._id)}
            className="ml-2 p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  </div>
</div>
  
          {/* Menu Items Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Menu Items</h3>
            </div>
            <div className="p-6">
              {menuItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No menu items found. Click "Add Menu Item" to create your first menu item.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {menuItems.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                                No image
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 line-clamp-2">{item.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{item.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
  <div className="flex justify-center space-x-2">
    <Tooltip content="Edit Menu Item">
      <Link to={`/restaurant/menu/edit/${item._id}`}>
        <button className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </Link>
    </Tooltip>
    <Tooltip content="Delete Menu Item">
      <button 
        onClick={() => handleDeleteMenuItem(item._id)}
        className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </Tooltip>
  </div>
</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MenuManagement;