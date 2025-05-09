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
        
        if (menuItem.image) {
          setImagePreview(menuItem.image);
        }
        
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spinner style={{ height: '3rem', width: '3rem', color: '#3b82f6' }} />
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
                Update Menu Item
              </Typography>
              {restaurant && (
                <Typography variant="small" color="white" style={{ opacity: 0.8 }}>
                  Restaurant: {restaurant.name}
                </Typography>
              )}
            </div>
          </div>
        </CardHeader>
        
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
                Menu Item Information
              </Typography>
              <Typography variant="small" style={{ color: '#6b7280' }}>
                Please fill in all required fields. The information will be used to display the menu item to customers.
              </Typography>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Name Field */}
              <div style={{ marginBottom: '1.5rem' }}>
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
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      backgroundColor: 'white',
                      border: errors.name ? '1px solid #ef4444' : '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      color: '#1f2937',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    placeholder="e.g., Margherita Pizza"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.name ? '#ef4444' : '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                {errors.name && (
                  <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.name}
                  </Typography>
                )}
              </div>

              {/* Description Field */}
              <div style={{ marginBottom: '1.5rem' }}>
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
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '1rem 1rem 1rem 3rem',
                      backgroundColor: 'white',
                      border: errors.description ? '1px solid #ef4444' : '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      color: '#1f2937',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                    placeholder="Describe your menu item"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.description ? '#ef4444' : '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '1rem',
                    color: '#9ca3af'
                  }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
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
                <div style={{ flex: 1, marginBottom: '1.5rem' }}>
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
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      required
                      style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        backgroundColor: 'white',
                        border: errors.price ? '1px solid #ef4444' : '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                      placeholder="9.99"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.price ? '#ef4444' : '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af'
                    }}>
                      <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  {errors.price && (
                    <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      {errors.price}
                    </Typography>
                  )}
                </div>

                {/* Category Field */}
                <div style={{ flex: 1, marginBottom: '1.5rem' }}>
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
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        backgroundColor: 'white',
                        border: errors.category ? '1px solid #ef4444' : '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                      placeholder="e.g., Pizza, Dessert, Drinks"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.category ? '#ef4444' : '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af'
                    }}>
                      <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                  </div>
                  {errors.category && (
                    <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      {errors.category}
                    </Typography>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: '1.5rem' }}>
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
                      padding: '1rem 1rem 1rem 3rem',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      color: '#1f2937',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {imagePreview && (
                  <div style={{ marginTop: '1rem' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Availability Switch */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="isAvailable" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Availability
                  </label>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontSize: '0.75rem', 
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem'
                  }}>
                    <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Menu visibility</span>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  backgroundColor: 'white',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  <Switch
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleAvailabilityChange}
                    color="blue"
                    ripple={false}
                    style={{
                      width: '48px',
                      height: '24px',
                      padding: '0',
                      '--switch-checked-color': '#3b82f6'
                    }}
                  />
                  <Typography variant="small" style={{ color: '#4b5563' }}>
                    {formData.isAvailable ? 'This item is currently available' : 'This item is currently unavailable'}
                  </Typography>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ 
                borderTop: '1px solid #e5e7eb', 
                paddingTop: '1.5rem',
                marginTop: '1.5rem',
                display: 'flex', 
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <div>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      padding: '1rem 2rem',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      fontWeight: '600',
                      borderRadius: '0.75rem',
                      border: '1px solid #e5e7eb',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <svg style={{ 
                      width: '1.25rem',
                      height: '1.25rem',
                      marginRight: '0.75rem'
                    }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '1rem 3rem',
                    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontSize: '1rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.1)'
                  }}
                  onMouseEnter={(e) => !saving && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !saving && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {saving ? (
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <Spinner style={{ height: '1rem', width: '1rem', color: 'white', marginRight: '0.5rem' }} />
                      <span>Updating...</span>
                    </span>
                  ) : (
                    <>
                      <svg style={{ 
                        width: '1.25rem',
                        height: '1.25rem',
                        marginRight: '0.75rem'
                      }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default UpdateMenuItem;