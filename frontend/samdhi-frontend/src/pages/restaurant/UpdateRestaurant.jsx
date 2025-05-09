// src/pages/restaurant/UpdateRestaurant.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Typography, 
  Button
} from '@material-tailwind/react';

const cuisineTypes = [
  'Italian', 'Chinese', 'Mexican', 'Indian', 'American',
  'Japanese', 'Thai', 'Mediterranean', 'French', 'Greek',
  'Korean', 'Vietnamese', 'Lebanese', 'Spanish', 'Other'
];

const UpdateRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    contactNumber: '',
    email: '',
    operatingHours: {
      startTime: '',
      endTime: ''
    },
    cuisine: '',
    isOpen: true,
    image: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setInitialLoading(true);
        const response = await api.get(`/restaurants/${id}`);
        const { data } = response;
        
        setFormData({
          name: data.name,
          description: data.description,
          address: data.address,
          contactNumber: data.contactNumber,
          email: data.email,
          operatingHours: data.operatingHours,
          cuisine: data.cuisine,
          isOpen: data.isOpen,
          image: data.image || ''
        });

        if (data.image) {
          setImagePreview(data.image);
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        showToast.error(error.response?.data?.message || 'Failed to load restaurant data');
        navigate('/restaurant/list');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.address.city.trim()) newErrors.city = 'City is required';
    if (!formData.address.state.trim()) newErrors.state = 'State is required';
    if (!formData.address.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
      newErrors.contactNumber = 'Enter a valid 10-digit phone number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    
    if (!formData.operatingHours.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.operatingHours.endTime) newErrors.endTime = 'End time is required';
    if (!formData.cuisine) newErrors.cuisine = 'Cuisine type is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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

  const handleCuisineChange = (value) => {
    setFormData({
      ...formData,
      cuisine: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast.error('Please fill all required fields correctly');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.put(`/restaurants/${id}`, formData);
      showToast.success(response.data.message || 'Restaurant updated successfully');
      navigate('/restaurant/dashboard');
    } catch (error) {
      console.error('Update error:', error);
      showToast.error(error.response?.data?.message || 'Failed to update restaurant');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <LoadingSpinner size="lg" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <Typography variant="h5" color="white" style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                Update Restaurant
              </Typography>
              <Typography variant="small" color="white" style={{ opacity: 0.8 }}>
                Update restaurant information and details
              </Typography>
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
                Restaurant Information
              </Typography>
              <Typography variant="small" style={{ color: '#6b7280' }}>
                Please fill in all required fields. The information will be used to display your restaurant to customers.
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
                  Restaurant Name
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
                    placeholder="Restaurant Name"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
                    rows="4"
                    required
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
                    placeholder="Describe your restaurant..."
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.description ? '#ef4444' : '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                {errors.description && (
                  <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.description}
                  </Typography>
                )}
              </div>

              {/* Cuisine Type Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="cuisine" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Cuisine Type
                </label>
                <div style={{
                  position: 'relative',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  <select
                    id="cuisine"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={(e) => handleCuisineChange(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      backgroundColor: 'white',
                      border: errors.cuisine ? '1px solid #ef4444' : '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      color: '#1f2937',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.cuisine ? '#ef4444' : '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select Cuisine Type</option>
                    {cuisineTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
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
                  <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    pointerEvents: 'none'
                  }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.cuisine && (
                  <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.cuisine}
                  </Typography>
                )}
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="restaurantImage" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Restaurant Image
                </label>
                <div style={{
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  <input
                    type="file"
                    id="restaurantImage"
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
                        width: '150px', 
                        height: '150px', 
                        objectFit: 'cover',
                        borderRadius: '0.75rem',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                  </div>
                )}
              </div>

              
                <Typography variant="h6" style={{ color: '#1e40af', fontWeight: '600', marginBottom: '1rem' }}>
                  Contact Information
                </Typography>
                
                {/* Email Field */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="email" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Email Address
                  </label>
                  <div style={{
                    position: 'relative',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        backgroundColor: 'white',
                        border: errors.email ? '1px solid #ef4444' : '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                      placeholder="restaurant@example.com"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.email ? '#ef4444' : '#e5e7eb';
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  {errors.email && (
                    <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      {errors.email}
                    </Typography>
                  )}
                </div>

                {/* Phone Number Field */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="contactNumber" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Contact Number
                  </label>
                  <div style={{
                    position: 'relative',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        backgroundColor: 'white',
                        border: errors.contactNumber ? '1px solid #ef4444' : '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                      placeholder="(123) 456-7890"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.contactNumber ? '#ef4444' : '#e5e7eb';
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  {errors.contactNumber && (
                    <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      {errors.contactNumber}
                    </Typography>
                  )}
                </div>
              

              {/* Address Information Section */}
              
                <Typography variant="h6" style={{ color: '#1e40af', fontWeight: '600', marginBottom: '1rem' }}>
                  Address Information
                </Typography>
                
                {/* Street Address Field */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="street" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Street Address
                  </label>
                  <div style={{
                    position: 'relative',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}>
                    <input
                      type="text"
                      id="street"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        backgroundColor: 'white',
                        border: errors.street ? '1px solid #ef4444' : '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                      placeholder="123 Main St"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.street ? '#ef4444' : '#e5e7eb';
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  {errors.street && (
                    <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      {errors.street}
                    </Typography>
                  )}
                </div>

                {/* City, State, ZIP Fields */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  {/* City Field */}
                  <div style={{ flex: '1 1 30%', minWidth: '200px' }}>
                    <label htmlFor="city" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      City
                    </label>
                    <div style={{
                      position: 'relative',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                      <input
                        type="text"
                        id="city"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          backgroundColor: 'white',
                          border: errors.city ? '1px solid #ef4444' : '1px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          color: '#1f2937',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease',
                          outline: 'none'
                        }}
                        placeholder="City"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3b82f6';
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.city ? '#ef4444' : '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    {errors.city && (
                      <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                        {errors.city}
                      </Typography>
                    )}
                  </div>

                  {/* State Field */}
                  <div style={{ flex: '1 1 30%', minWidth: '200px' }}>
                    <label htmlFor="state" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      State
                    </label>
                    <div style={{
                      position: 'relative',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                      <input
                        type="text"
                        id="state"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          backgroundColor: 'white',
                          border: errors.state ? '1px solid #ef4444' : '1px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          color: '#1f2937',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease',
                          outline: 'none'
                        }}
                        placeholder="State"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3b82f6';
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.state ? '#ef4444' : '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    {errors.state && (
                      <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                        {errors.state}
                      </Typography>
                    )}
                  </div>

                  {/* ZIP Code Field */}
                  <div style={{ flex: '1 1 30%', minWidth: '200px' }}>
                    <label htmlFor="zipCode" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      ZIP Code
                      </label>
                    <div style={{
                      position: 'relative',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                      <input
                        type="text"
                        id="zipCode"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          backgroundColor: 'white',
                          border: errors.zipCode ? '1px solid #ef4444' : '1px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          color: '#1f2937',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease',
                          outline: 'none'
                        }}
                        placeholder="ZIP Code"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3b82f6';
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.zipCode ? '#ef4444' : '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    {errors.zipCode && (
                      <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                        {errors.zipCode}
                      </Typography>
                    )}
                  </div>
                </div>
             

              {/* Operating Hours Section */}
             
                <Typography variant="h6" style={{ color: '#1e40af', fontWeight: '600', marginBottom: '1rem' }}>
                  Operating Hours
                </Typography>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  {/* Start Time Field */}
                  <div style={{ flex: '1 1 45%', minWidth: '200px' }}>
                    <label htmlFor="startTime" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Opening Time
                    </label>
                    <div style={{
                      position: 'relative',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                      <input
                        type="time"
                        id="startTime"
                        name="operatingHours.startTime"
                        value={formData.operatingHours.startTime}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem 1rem 1rem 3rem',
                          backgroundColor: 'white',
                          border: errors.startTime ? '1px solid #ef4444' : '1px solid #e5e7eb',
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
                          e.target.style.borderColor = errors.startTime ? '#ef4444' : '#e5e7eb';
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    {errors.startTime && (
                      <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                        {errors.startTime}
                      </Typography>
                    )}
                  </div>

                  {/* End Time Field */}
                  <div style={{ flex: '1 1 45%', minWidth: '200px' }}>
                    <label htmlFor="endTime" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Closing Time
                    </label>
                    <div style={{
                      position: 'relative',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                      <input
                        type="time"
                        id="endTime"
                        name="operatingHours.endTime"
                        value={formData.operatingHours.endTime}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem 1rem 1rem 3rem',
                          backgroundColor: 'white',
                          border: errors.endTime ? '1px solid #ef4444' : '1px solid #e5e7eb',
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
                          e.target.style.borderColor = errors.endTime ? '#ef4444' : '#e5e7eb';
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    {errors.endTime && (
                      <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                        {errors.endTime}
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Restaurant Status Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isOpen}
                      onChange={() => setFormData(prev => ({ ...prev, isOpen: !prev.isOpen }))}
                      style={{ 
                        position: 'absolute',
                        opacity: 0,
                        width: 0,
                        height: 0
                      }}
                    />
                    <div style={{
                      position: 'relative',
                      width: '3.5rem',
                      height: '2rem',
                      backgroundColor: formData.isOpen ? '#10b981' : '#e5e7eb',
                      borderRadius: '9999px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: formData.isOpen ? 'calc(100% - 1.75rem)' : '0.25rem',
                        top: '0.25rem',
                        width: '1.5rem',
                        height: '1.5rem',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}></div>
                    </div>
                    <span style={{ 
                      marginLeft: '0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      Restaurant is currently {formData.isOpen ? (
                        <span style={{ color: '#10b981', fontWeight: '600' }}>Open</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: '600' }}>Closed</span>
                      )}
                    </span>
                  </label>
                </div>
              

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <Button
                  variant="outlined"
                  color="blue"
                  onClick={() => navigate('/restaurant/dashboard')}
                  style={{
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1.5rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  color="blue"
                  disabled={loading}
                  style={{
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {loading && <LoadingSpinner size="sm" />}
                  Update Restaurant
                </Button>
              </div>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
  
  );
};

export default UpdateRestaurant;