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
      <Card className="mb-6">
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
            <Typography variant="h2" color="white">
              {restaurant.name}
            </Typography>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap justify-between items-start mb-4">
            <div>
              <div className="flex items-center mb-2">
                <Typography variant="h5" color="blue-gray" className="mr-3">
                  {restaurant.name}
                </Typography>
                <Chip
                  value={isOpen ? "Open" : "Closed"}
                  color={isOpen ? "green" : "red"}
                  size="sm"
                />
              </div>
              <Typography variant="paragraph" color="gray" className="mb-1">
                {restaurant.cuisine} Cuisine
              </Typography>
              <Typography variant="paragraph" className="mb-2">
                {restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}
              </Typography>
              <Typography variant="small" color="gray">
                Hours: {restaurant.operatingHours.startTime} - {restaurant.operatingHours.endTime}
              </Typography>  
            </div>
          </div>
          
          <Typography variant="paragraph" className="mb-6">
            {restaurant.description}
          </Typography>
          
          <Typography variant="h5" className="mb-4">Menu</Typography>
          
          {categories.length === 0 ? (
            <Typography variant="paragraph" className="text-center py-6">
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
                          ? 'bg-black text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setActiveTab(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <Typography variant="h6" className="mb-4 font-bold">
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