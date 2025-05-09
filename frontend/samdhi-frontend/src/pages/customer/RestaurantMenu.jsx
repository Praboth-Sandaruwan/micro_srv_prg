// src/pages/customer/RestaurantMenu.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Button
} from '@material-tailwind/react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const RestaurantMenu = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        // Fetch restaurant details
        const restaurantRes = await api.get(`/restaurants/${id}`);
        setRestaurant(restaurantRes.data);
        
        // Fetch menu items
        const menuRes = await api.get(`/menu/public/restaurant/${id}`);
        setMenuItems(menuRes.data.menuItemsByCategory || {});
        setCategories(menuRes.data.categories || []);
        
        if (menuRes.data.categories && menuRes.data.categories.length > 0) {
          setActiveTab(menuRes.data.categories[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast.error('Failed to load restaurant information');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantAndMenu();
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" />;

  if (!restaurant) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
        <Typography variant="h4" className="text-center">
          Restaurant not found
        </Typography>
      </div>
    );
  }

  // Function to determine if restaurant is open based on operating hours
  const isOpenNow = () => {
    if (!restaurant.isOpen) return false;
    
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    return restaurant.operatingHours.startTime <= currentTime && 
           restaurant.operatingHours.endTime >= currentTime;
  };

  const isOpen = isOpenNow();

  const MenuItem = ({ item }) => {
    const navigate = useNavigate();

    return (
      <div 
        className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col mb-6" 
        onClick={() => navigate(`/customer/menu-items/${item._id}`)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-grow max-w-[70%]">
            <Typography variant="h5" className="font-bold text-black mb-1">
              {item.name}
            </Typography>
            <div className="flex items-center mb-2">
              <Typography variant="h6" color="blue-gray" className="font-semibold">
                ${item.price.toFixed(2)}
              </Typography>
              <div className="flex items-center ml-3">
                <span className="text-sm">•</span>
                <span className="ml-1 text-green-600 font-medium text-sm">
                  {Math.floor(85 + Math.random() * 10)}% ({Math.floor(60 + Math.random() * 150)})
                </span>
              </div>
            </div>
            <Typography variant="small" className="text-gray-600 text-sm mb-2 line-clamp-2">
              {item.description}
            </Typography>
          </div>
          <div className="w-24 h-24 rounded-lg overflow-hidden relative ml-2">
            <img
              src={item.image || '/default-food.jpg'}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute right-2 bottom-2 bg-white rounded-full p-1 shadow-md cursor-pointer">
              <span className="text-xl font-bold">+</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      <Card className="mb-6 overflow-hidden">
        <CardHeader
          floated={false}
          shadow={false}
          className="relative h-64 flex items-center justify-center"
        >
          <img
            src={restaurant.image || '/default-restaurant.jpg'}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Typography variant="h2" color="white" className="text-center px-4">
              {restaurant.name}
            </Typography>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap justify-between items-start mb-4">
            <div>
              <div className="flex items-center mb-3">
                <Typography variant="h5" color="blue-gray" className="mr-3">
                  {restaurant.name}
                </Typography>
                <Chip
                  value={isOpen ? "Open Now" : "Closed"}
                  color={isOpen ? "green" : "red"}
                  size="sm"
                  icon={
                    isOpen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28-7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    )
                  }
                />
              </div>
              
              <div className="flex items-center mb-2 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
                  <path d="M2.5 3A1.5 1.5 0 001 4.5v13A1.5 1.5 0 002.5 19h15a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0017.5 3h-15zm0 3h15v7.5a.75.75 0 01-.75.75h-13.5A.75.75 0 012 13.5V6z" />
                </svg>
                <Typography variant="paragraph" className="text-gray-700">
                  {restaurant.cuisine} Cuisine
                </Typography>
              </div>
              
              <div className="flex items-start mb-2 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 mr-2">
                  <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                </svg>
                <Typography variant="paragraph" className="text-gray-700">
                  {restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}
                </Typography>
              </div>
              
              <div className="flex items-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                </svg>
                <Typography variant="small" className="text-gray-700">
                  Hours: {restaurant.operatingHours.startTime} - {restaurant.operatingHours.endTime}
                </Typography>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600 mt-0.5 mr-3">
                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
              </svg>
              <Typography variant="paragraph" className="text-gray-700">
                {restaurant.description}
              </Typography>
            </div>
          </div>
          
          <Typography variant="h5" className="mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 text-blue-600">
              <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 007.5 9.75c.627.47 1.406.75 2.25.75.844 0 1.624-.28 2.25-.75.626.47 1.406.75 2.25.75.844 0 1.623-.28 2.25-.75a3.75 3.75 0 004.902-5.652l-1.3-1.299a1.875 1.875 0 00-1.325-.549H5.223z" />
              <path fillRule="evenodd" d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 009.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 002.25.506c.804 0 1.567-.182 2.25-.506 1.42.674 3.08.675 4.5.001v8.755h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3zm3-6a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v3a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-3zm8.25-.75a.75.75 0 00-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-5.25a.75.75 0 00-.75-.75h-3z" clipRule="evenodd" />
            </svg>
            Menu
          </Typography>
          
          {categories.length === 0 ? (
            <Typography variant="paragraph" className="text-center py-6 text-gray-500">
              No menu items available for this restaurant.
            </Typography>
          ) : (
            <div className="mb-8">
              <div className="overflow-x-auto scrollbar-hide pb-2">
                <div className="flex space-x-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`px-6 py-3 whitespace-nowrap rounded-full transition-all duration-200 font-medium min-w-32 text-center ${
                        activeTab === category
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100'
                      }`}
                      onClick={() => setActiveTab(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-100 pt-4">
                <Typography variant="h6" className="mb-4 font-bold text-gray-800">
                  {activeTab}
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {menuItems[activeTab]?.map((item) => (
                    <MenuItem key={item._id} item={item} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default RestaurantMenu;