// src/pages/customer/MenuItemDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Textarea
} from '@material-tailwind/react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const MenuItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [additionalCharges, setAdditionalCharges] = useState(false);

  useEffect(() => {
    const fetchMenuItemDetails = async () => {
      try {
        const menuItemRes = await api.get(`/menu/${id}`);
        setMenuItem(menuItemRes.data.menuItem);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast.error('Failed to load menu item information');
        navigate('/customer/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItemDetails();
  }, [id, navigate]);

  if (loading) return <LoadingSpinner size="lg" />;

  if (!menuItem) {
    return (
      <div className="px-6 py-4 max-w-screen-lg mx-auto">
        <Typography variant="h4" className="text-center">
          Menu item not found
        </Typography>
      </div>
    );
  }

  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, newQuantity));
  };

  const handleAddToCart = () => {
    showToast.success(`${menuItem.name} added to cart`);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="flex flex-col max-w-screen-lg mx-auto px-4 py-16">
        {/* Product Header */}
        <div className="flex flex-col md:flex-row gap-10 mb-8">
          {/* Image Section */}
          <div className="w-full md:w-1/2 h-[28rem] rounded-xl overflow-hidden shadow-md">
            <img
              src={menuItem.image || '/default-food.jpg'}
              alt={menuItem.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          
          {/* Details Section */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="mb-4">
              <Typography variant="h2" className="text-3xl font-bold text-gray-900">
                {menuItem.name}
              </Typography>
              <Typography variant="h3" className="text-2xl font-semibold text-blue-600 mt-2">
                ${menuItem.price.toFixed(2)}
              </Typography>
            </div>
            
            <Typography variant="paragraph" className="text-gray-600 mb-6 leading-relaxed">
              {menuItem.description}
            </Typography>
            
            {menuItem.popularity && (
              <div className="mb-6">
                <Chip
                  value={`#${menuItem.popularity} most popular`}
                  size="sm"
                  className="bg-blue-50 text-blue-600 border border-blue-100"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  }
                />
              </div>
            )}
            
            {/* Special Instructions */}
            <div className="mb-8">
              <Typography variant="h6" className="font-medium mb-3 text-gray-800">
                Special Instructions
              </Typography>
              <Textarea
                placeholder="Add any special requests or dietary needs..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors duration-300"
                rows={3}
              />
              <Typography variant="small" className="text-gray-500 mt-2">
                You may be charged for extras.
              </Typography>
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center mb-8">
              <Typography variant="small" className="font-medium text-gray-700 mr-4">
                Quantity:
              </Typography>
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden shadow-sm">
                <button
                  className="px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="px-4 py-2 text-gray-800 font-medium w-12 text-center">{quantity}</span>
                <button
                  className="px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Add to Order Button */}
            <Button
              size="lg"
              fullWidth
              className="py-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
              onClick={handleAddToCart}
            >
              Add {quantity} to order • ${(menuItem.price * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetails;