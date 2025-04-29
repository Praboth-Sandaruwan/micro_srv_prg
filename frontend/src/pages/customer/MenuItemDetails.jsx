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
      <div className="flex flex-col max-w-screen-lg mx-auto px-4 py-6">
        {/* Product Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Image Section */}
          <div className="w-full md:w-1/2 h-96">
            <img
              src={menuItem.image || '/default-food.jpg'}
              alt={menuItem.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          
          {/* Details Section */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="mb-2">
              <Typography variant="h2" className="text-3xl font-bold text-gray-900">
                {menuItem.name}
              </Typography>
              <Typography variant="h3" className="text-2xl font-medium text-gray-700 mt-2">
                ${menuItem.price.toFixed(2)}
              </Typography>
            </div>
            
            <Typography variant="paragraph" className="text-gray-700 mb-4">
              {menuItem.description}
            </Typography>
            
            {menuItem.popularity && (
              <div className="mb-4">
                <Chip
                  value={`#${menuItem.popularity} most liked`}
                  size="sm"
                  className="bg-gray-100 text-gray-800"
                />
              </div>
            )}
            
            
            
            {/* Special Instructions */}
            <div className="mb-6">
              <Typography variant="h6" className="font-medium mb-2">
                Special Instructions
              </Typography>
              <Textarea
                placeholder="Add a note"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full border border-gray-300 rounded-lg"
              />
              <Typography variant="small" className="text-gray-500 mt-2">
                You may be charged for extras.
              </Typography>
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center mb-6">
              <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                <button
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(quantity - 1)}
                >
                  -
                </button>
                <span className="px-3 py-1">{quantity}</span>
                <button
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Add to Order Button */}
            <Button
              color="black"
              size="lg"
              fullWidth
              className="py-4 rounded-lg bg-black text-white"
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