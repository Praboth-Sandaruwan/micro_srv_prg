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
        
        const params = new URLSearchParams(location.search);
        const restaurantId = params.get('restaurantId');
        
        if (restaurantId) {
          setFormData(prev => ({
            ...prev,
            restaurantId
          }));
        } else if (response.data.length > 0) {
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '70vh' 
      }}>
        <Spinner style={{ height: '3rem', width: '3rem', color: '#3b82f6' }} />
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div style={{ 
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
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
      maxWidth: '1024px',
      margin: '0 auto',
      backgroundImage: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
      minHeight: 'calc(100vh - 4rem)'
    }}>
      <Card style={{ boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
        <CardHeader
          floated={false}
          variant="gradient"
          color="blue"
          style={{ 
            padding: '1.5rem',
            margin: '0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, #3b82f6, #2563eb)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
            }}>
              <svg style={{ width: '1.75rem', height: '1.75rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <Typography variant="h5" color="white" style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                Add New Menu Item
              </Typography>
              <Typography variant="small" color="white" style={{ opacity: 0.8 }}>
                Create a new item for your restaurant menu
              </Typography>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardBody style={{ padding: '2.5rem' }}>
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              borderRadius: '0.75rem', 
              padding: '1.5rem', 
              marginBottom: '2rem',
              border: '1px solid #e0f2fe',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ 
                minWidth: '3rem', 
                height: '3rem', 
                borderRadius: '50%', 
                backgroundColor: '#dbeafe', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#2563eb'
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <Typography variant="h6" style={{ color: '#1e40af', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Menu Item Details
                </Typography>
                <Typography variant="small" style={{ color: '#6b7280' }}>
                  Please fill in all required fields. The information will be displayed to customers.
                </Typography>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Restaurant Selection */}
              <div>
                <label htmlFor="restaurantId" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Restaurant
                </label>
                <div style={{
                  position: 'relative',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  <Select
                    name="restaurantId"
                    value={formData.restaurantId}
                    onChange={handleRestaurantChange}
                    error={!!errors.restaurantId}
                    size="lg"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: 'white',
                      border: errors.restaurantId ? '1px solid #ef4444' : '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      color: '#1f2937',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                  >
                    {restaurants.map(restaurant => (
                      <Option key={restaurant._id} value={restaurant._id}>
                        {restaurant.name}
                      </Option>
                    ))}
                  </Select>
                </div>
                {errors.restaurantId && (
                  <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.restaurantId}
                  </Typography>
                )}
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Item Name
                </label>
                <div style={{
                  position: 'relative',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  <Input
                    name="name"
                    size="lg"
                    placeholder="e.g., Margherita Pizza"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: 'white',
                      border: errors.name ? '1px solid #ef4444' : '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      color: '#1f2937',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                  />
                </div>
                {errors.name && (
                  <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.name}
                  </Typography>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Description
                </label>
                <div style={{
                  position: 'relative',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  <Textarea
                    name="description"
                    size="lg"
                    placeholder="Describe your menu item"
                    value={formData.description}
                    onChange={handleChange}
                    error={!!errors.description}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: 'white',
                      border: errors.description ? '1px solid #ef4444' : '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      color: '#1f2937',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      minHeight: '120px'
                    }}
                  />
                </div>
                {errors.description && (
                  <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.description}
                  </Typography>
                )}
              </div>

              {/* Price and Category Fields */}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {/* Price Field */}
                <div style={{ flex: 1 }}>
                  <label htmlFor="price" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Price ($)
                  </label>
                  <div style={{
                    position: 'relative',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}>
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
                      style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'white',
                        border: errors.price ? '1px solid #ef4444' : '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                    />
                  </div>
                  {errors.price && (
                    <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      {errors.price}
                    </Typography>
                  )}
                </div>

                {/* Category Field */}
                <div style={{ flex: 1 }}>
                  <label htmlFor="category" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Category
                  </label>
                  <div style={{
                    position: 'relative',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}>
                    <Input
                      name="category"
                      size="lg"
                      placeholder="e.g., Pizza, Dessert, Drinks"
                      value={formData.category}
                      onChange={handleChange}
                      error={!!errors.category}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'white',
                        border: errors.category ? '1px solid #ef4444' : '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                    />
                  </div>
                  {errors.category && (
                    <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      {errors.category}
                    </Typography>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="menuItemImage" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Item Image
                </label>
                <div style={{
                  position: 'relative',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  <input
                    type="file"
                    id="menuItemImage"
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      color: '#1f2937',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                  />
                </div>
                {imagePreview && (
                  <div style={{ marginTop: '1rem' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Availability Switch */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb'
              }}>
                <Switch
                  checked={formData.isAvailable}
                  onChange={handleAvailabilityChange}
                  color="blue"
                />
                <div>
                  <Typography variant="small" style={{ fontWeight: '500', color: '#374151' }}>
                    {formData.isAvailable ? 'Available' : 'Not Available'}
                  </Typography>
                  <Typography variant="small" style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    Toggle to show/hide this item on the menu
                  </Typography>
                </div>
              </div>
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
              style={{
                padding: '0.875rem 1.75rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </Button>
            <Button
              type="submit"
              color="blue"
              disabled={saving}
              style={{
                padding: '0.875rem 2.5rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.1)'
              }}
            >
              {saving ? (
                <>
                  <Spinner style={{ height: '1rem', width: '1rem' }} />
                  Creating...
                </>
              ) : (
                <>
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Menu Item
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddMenuItem;