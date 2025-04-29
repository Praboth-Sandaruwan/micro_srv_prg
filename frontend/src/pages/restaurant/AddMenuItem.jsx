import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Textarea,
  Button,
  Select,
  Option,
  Spinner,
  Switch
} from '@material-tailwind/react';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const AddMenuItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    restaurantId: '',
    isAvailable: true,
    image: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await api.get('/menu/my-restaurants');
        setRestaurants(response.data);
        
        // Get restaurantId from URL query parameters if it exists
        const params = new URLSearchParams(location.search);
        const restaurantId = params.get('restaurantId');
        
        if (restaurantId) {
          // Set the specified restaurant as selected
          setFormData(prev => ({
            ...prev,
            restaurantId
          }));
        } else if (response.data.length > 0) {
          // Set first restaurant as default if available and no specific restaurant is requested
          setFormData(prev => ({
            ...prev,
            restaurantId: response.data[0]._id
          }));
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        showToast.error(error.response?.data?.message || 'Failed to load restaurants');
        navigate('/restaurant/menu');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [navigate, location.search]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.restaurantId) {
      newErrors.restaurantId = 'Restaurant is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleRestaurantChange = (value) => {
    setFormData({
      ...formData,
      restaurantId: value
    });
    
    if (errors.restaurantId) {
      setErrors({
        ...errors,
        restaurantId: ''
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvailabilityChange = () => {
    setFormData({
      ...formData,
      isAvailable: !formData.isAvailable
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      const newMenuItem = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      await api.post('/menu', newMenuItem);
      showToast.success('Menu item created successfully');
      navigate('/restaurant/menu');
    } catch (error) {
      console.error('Error creating menu item:', error);
      showToast.error(error.response?.data?.message || 'Failed to create menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/restaurant/menu');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Spinner style={{ height: '3rem', width: '3rem', color: '#3b82f6' }} />
      </div>
    );
  }

  // If no restaurants are found
  if (restaurants.length === 0) {
    return (
      <div style={{ 
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '3rem' }}>
            <Typography variant="h5" color="blue-gray" style={{ marginBottom: '1rem' }}>
              No Restaurants Found
            </Typography>
            <Typography variant="paragraph" color="gray">
              You need to register a restaurant before adding menu items.
            </Typography>
            <Button 
              color="blue" 
              variant="gradient" 
              style={{ marginTop: '1rem' }}
              onClick={() => navigate('/restaurant/register')}
            >
              Register Restaurant
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <Card>
        <CardHeader
          color="blue"
          style={{ 
            padding: '1.5rem', 
            backgroundColor: '#f8fafc', 
            borderBottom: '1px solid #e2e8f0' 
          }}
        >
          <Typography variant="h5" color="blue-gray">
            Add New Menu Item
          </Typography>
          <Typography variant="paragraph" color="gray" style={{ marginTop: '0.5rem' }}>
            Create a new item for your restaurant menu
          </Typography>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardBody style={{ padding: '2rem 1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <Typography variant="small" color="blue-gray" style={{ 
                marginBottom: '0.5rem', 
                fontWeight: '500', 
                display: 'block' 
              }}>
                Select Restaurant
              </Typography>
              <Select
                name="restaurantId"
                value={formData.restaurantId}
                onChange={handleRestaurantChange}
                error={!!errors.restaurantId}
                size="lg"
              >
                {restaurants.map(restaurant => (
                  <Option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </Option>
                ))}
              </Select>
              {errors.restaurantId && (
                <Typography variant="small" color="red" style={{ marginTop: '0.25rem' }}>
                  {errors.restaurantId}
                </Typography>
              )}
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <Typography variant="small" color="blue-gray" style={{ 
                marginBottom: '0.5rem', 
                fontWeight: '500', 
                display: 'block' 
              }}>
                Item Name
              </Typography>
              <Input
                name="name"
                size="lg"
                placeholder="e.g., Margherita Pizza"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
              />
              {errors.name && (
                <Typography variant="small" color="red" style={{ marginTop: '0.25rem' }}>
                  {errors.name}
                </Typography>
              )}
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <Typography variant="small" color="blue-gray" style={{ 
                marginBottom: '0.5rem', 
                fontWeight: '500', 
                display: 'block' 
              }}>
                Description
              </Typography>
              <Textarea
                name="description"
                size="lg"
                placeholder="Describe your menu item"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
              />
              {errors.description && (
                <Typography variant="small" color="red" style={{ marginTop: '0.25rem' }}>
                  {errors.description}
                </Typography>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: '1' }}>
                <Typography variant="small" color="blue-gray" style={{ 
                  marginBottom: '0.5rem', 
                  fontWeight: '500', 
                  display: 'block' 
                }}>
                  Price ($)
                </Typography>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  size="lg"
                  placeholder="9.99"
                  value={formData.price}
                  onChange={handleChange}
                  error={!!errors.price}
                />
                {errors.price && (
                  <Typography variant="small" color="red" style={{ marginTop: '0.25rem' }}>
                    {errors.price}
                  </Typography>
                )}
              </div>
              
              <div style={{ flex: '1' }}>
                <Typography variant="small" color="blue-gray" style={{ 
                  marginBottom: '0.5rem', 
                  fontWeight: '500', 
                  display: 'block' 
                }}>
                  Category
                </Typography>
                <Input
                  name="category"
                  size="lg"
                  placeholder="e.g., Pizza, Dessert, Drinks"
                  value={formData.category}
                  onChange={handleChange}
                  error={!!errors.category}
                />
                {errors.category && (
                  <Typography variant="small" color="red" style={{ marginTop: '0.25rem' }}>
                    {errors.category}
                  </Typography>
                )}
              </div>
            </div>
            
            {/* Updated Image handling */}
            <div style={{ marginBottom: '1.5rem' }}>
              <Typography variant="small" color="blue-gray" style={{ 
                marginBottom: '0.5rem', 
                fontWeight: '500', 
                display: 'block' 
              }}>
                Item Image
              </Typography>
              <input
                type="file"
                id="menuItemImage"
                onChange={handleImageChange}
                accept="image/*"
                style={{ marginTop: '5px', marginBottom: '15px' }}
              />
              {imagePreview && (
                <div style={{ marginTop: '10px' }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Switch
                  checked={formData.isAvailable}
                  onChange={handleAvailabilityChange}
                  color="blue"
                />
                <Typography variant="small" color="blue-gray">
                  {formData.isAvailable ? 'Available' : 'Not Available'}
                </Typography>
              </div>
              <Typography variant="small" color="gray" style={{ marginTop: '0.25rem' }}>
                Toggle to show/hide this item on the menu
              </Typography>
            </div>
          </CardBody>
          
          <CardFooter style={{ 
            padding: '1.5rem', 
            backgroundColor: '#f8fafc', 
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem'
          }}>
            <Button
              color="gray"
              variant="outlined"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="blue"
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {saving ? (
                <>
                  <Spinner style={{ height: '1rem', width: '1rem' }} />
                  Creating...
                </>
              ) : 'Create Menu Item'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddMenuItem;