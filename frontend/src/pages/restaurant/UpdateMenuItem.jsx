import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const UpdateMenuItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    image: ''
  });
  const [errors, setErrors] = useState({});
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/menu/${id}`);
        const menuItem = response.data.menuItem;
        
        setFormData({
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
          category: menuItem.category,
          isAvailable: menuItem.isAvailable,
          image: menuItem.image || ''
        });
        
        // Set image preview if available
        if (menuItem.image) {
          setImagePreview(menuItem.image);
        }
        
        // Fetch restaurant details
        const restaurantResponse = await api.get(`/restaurants/${menuItem.restaurant}`);
        setRestaurant(restaurantResponse.data);
      } catch (error) {
        console.error('Error fetching menu item:', error);
        showToast.error(error.response?.data?.message || 'Failed to load menu item');
        navigate('/restaurant/menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [id, navigate]);

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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
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
      
      const updateData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      await api.put(`/menu/${id}`, updateData);
      showToast.success('Menu item updated successfully');
      navigate('/restaurant/menu');
    } catch (error) {
      console.error('Error updating menu item:', error);
      showToast.error(error.response?.data?.message || 'Failed to update menu item');
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
            Update Menu Item
          </Typography>
          {restaurant && (
            <Typography variant="paragraph" color="gray" style={{ marginTop: '0.5rem' }}>
              Restaurant: {restaurant.name}
            </Typography>
          )}
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardBody style={{ padding: '2rem 1.5rem' }}>
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
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UpdateMenuItem;