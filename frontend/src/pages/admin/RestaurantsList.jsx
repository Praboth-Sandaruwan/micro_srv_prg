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
  Dialog,
  DialogHeader,
  DialogBody,
} from '@material-tailwind/react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';
import '@fortawesome/fontawesome-free/css/all.min.css';

const RestaurantsList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

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

  const handleViewRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setViewDialogOpen(true);
  };

  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-70vh">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <Typography variant="h3" className="text-lg font-bold text-gray-800 mb-4 sm:mb-0">
         
        </Typography>

      </div>
      
      <Card className="mb-8 shadow border border-gray-200 rounded-lg overflow-hidden">
        <CardHeader floated={false} shadow={false} className="bg-white px-6 py-4 border-b border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full flex-1">
              <div className="relative flex items-center">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="text"
                  placeholder="Search restaurants"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              
              <Link to="/admin/pending-restaurants">
                <Button color="blue" className="bg-blue-600 hover:bg-blue-700 py-2.5 px-4 rounded shadow-sm">
                  View Pending Approvals
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-4 border-y border-gray-200 font-semibold text-xs text-gray-700 uppercase tracking-wider">Restaurant Image</th>
                  <th className="px-4 py-4 border-y border-gray-200 font-semibold text-xs text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-4 border-y border-gray-200 font-semibold text-xs text-gray-700 uppercase tracking-wider">Cuisine</th>
                  <th className="px-4 py-4 border-y border-gray-200 font-semibold text-xs text-gray-700 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-4 border-y border-gray-200 font-semibold text-xs text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 border-y border-gray-200 font-semibold text-xs text-gray-700 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRestaurants.length > 0 ? (
                  filteredRestaurants.map((restaurant) => (
                    <tr key={restaurant._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-12 h-12 rounded-md overflow-hidden">
                          <img 
                            src={restaurant.image || '/default-restaurant.jpg'} 
                            alt={restaurant.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Typography variant="paragraph" className="font-medium text-gray-800 text-sm">
                          {restaurant.name}
                        </Typography>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Typography variant="paragraph" className="text-gray-700 text-sm">
                          {restaurant.cuisine}
                        </Typography>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Typography variant="paragraph" className="text-gray-700 text-sm">
                          {restaurant.address?.city}, {restaurant.address?.state}
                        </Typography>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`
                          px-3 py-1 rounded-full text-xs font-medium inline-block
                          ${restaurant.isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                        `}>
                          {restaurant.isVerified ? 'Verified' : 'PENDING'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex justify-center gap-2">
                          <button 
                            className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs bg-red-500 hover:bg-red-600 text-white rounded shadow-sm"
                            onClick={() => handleViewRestaurant(restaurant)}
                          >
                            <i className="fas fa-eye"></i>
                            View
                          </button>
                          <Link to={`/admin/restaurants/edit/${restaurant._id}`}>
                            <button 
                              className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded shadow-sm"
                            >
                              <i className="fas fa-pencil-alt"></i>
                              Edit
                            </button>
                          </Link>
                          <button 
                            className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs bg-red-500 hover:bg-red-600 text-white rounded shadow-sm"
                            onClick={() => handleDeleteRestaurant(restaurant._id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center border-b">
                      <Typography variant="paragraph" className="text-gray-700">
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

      {/* Restaurant Details Dialog */}
      <Dialog open={viewDialogOpen} handler={() => setViewDialogOpen(false)} size="lg">
        {selectedRestaurant && (
          <>
            <DialogHeader className="flex justify-between border-b border-gray-200 pb-4">
              <Typography variant="h4">{selectedRestaurant.name}</Typography>
              <Button 
                variant="text" 
                color="blue-gray" 
                onClick={() => setViewDialogOpen(false)}
                className="mt-0"
              >
                <i className="fas fa-times"></i>
              </Button>
            </DialogHeader>
            <DialogBody className="p-6 overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="col-span-2">
                  <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={selectedRestaurant.image || '/default-restaurant.jpg'} 
                      alt={selectedRestaurant.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`
                    px-3 py-1 rounded-full text-sm font-medium inline-block mb-4
                    ${selectedRestaurant.isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                  `}>
                    {selectedRestaurant.isVerified ? 'Verified' : 'Pending Verification'}
                  </div>
                  <div className="mb-4">
                    <Typography variant="small" className="font-semibold text-gray-500 mb-1">
                      CUISINE
                    </Typography>
                    <Typography variant="paragraph" className="font-medium">
                      {selectedRestaurant.cuisine}
                    </Typography>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="mb-4">
                    <Typography variant="small" className="font-semibold text-gray-500 mb-1">
                      DESCRIPTION
                    </Typography>
                    <Typography variant="paragraph">
                      {selectedRestaurant.description || 'No description available'}
                    </Typography>
                  </div>
                  <div className="mb-4">
                    <Typography variant="small" className="font-semibold text-gray-500 mb-1">
                      ADDRESS
                    </Typography>
                    <Typography variant="paragraph">
                      {selectedRestaurant.address?.street}, {selectedRestaurant.address?.city}, 
                      {selectedRestaurant.address?.state} {selectedRestaurant.address?.zipCode}
                    </Typography>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <Typography variant="small" className="font-semibold text-gray-500 mb-1">
                        CONTACT NUMBER
                      </Typography>
                      <Typography variant="paragraph">
                        {selectedRestaurant.contactNumber}
                      </Typography>
                    </div>
                    <div className="mb-4">
                      <Typography variant="small" className="font-semibold text-gray-500 mb-1">
                        EMAIL
                      </Typography>
                      <Typography variant="paragraph">
                        {selectedRestaurant.email}
                      </Typography>
                    </div>
                  </div>
                  <div className="mb-4">
                    <Typography variant="small" className="font-semibold text-gray-500 mb-1">
                      OPERATING HOURS
                    </Typography>
                    <Typography variant="paragraph">
                      {selectedRestaurant.operatingHours?.startTime} - {selectedRestaurant.operatingHours?.endTime}
                    </Typography>
                  </div>
                </div>
              </div>
            </DialogBody>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default RestaurantsList;