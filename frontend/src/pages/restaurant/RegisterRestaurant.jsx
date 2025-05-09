// src/pages/restaurant/RegisterRestaurant.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const cuisineTypes = [
  'Italian', 'Chinese', 'Mexican', 'Indian', 'American', 
  'Japanese', 'Thai', 'Mediterranean', 'French', 'Greek',
  'Korean', 'Vietnamese', 'Lebanese', 'Spanish', 'Other'
];

const RegisterRestaurant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
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
    location: {
      latitude: '',
      longitude: ''
    },
    contactNumber: '',
    email: '',
    operatingHours: {
      startTime: '09:00',
      endTime: '22:00'
    },
    cuisine: '',
    image: ''
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.address.city.trim()) newErrors.city = 'City is required';
    if (!formData.address.state.trim()) newErrors.state = 'State is required';
    if (!formData.address.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    // Validate location
    if (!formData.location.latitude) {
      newErrors.latitude = 'Latitude is required';
    } else if (isNaN(parseFloat(formData.location.latitude))) {
      newErrors.latitude = 'Latitude must be a valid number';
    }
    
    if (!formData.location.longitude) {
      newErrors.longitude = 'Longitude is required';
    } else if (isNaN(parseFloat(formData.location.longitude))) {
      newErrors.longitude = 'Longitude must be a valid number';
    }
    
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
    if (!formData.image) newErrors.image = 'Restaurant image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
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

  const handleCuisineChange = (value) => {
    setFormData({
      ...formData,
      cuisine: value
    });
  };

  const handleGetCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      showToast.error('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        setFormData({
          ...formData,
          location: {
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }
        });
        
        setLocationLoading(false);
        showToast.success('Location coordinates retrieved successfully');
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Failed to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get location timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred getting your location';
        }
        
        showToast.error(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast.error('Please fill all required fields correctly');
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert location values to numbers before sending
      const dataToSend = {
        ...formData,
        location: {
          latitude: parseFloat(formData.location.latitude),
          longitude: parseFloat(formData.location.longitude)
        }
      };
      
      const response = await api.post('/restaurants', dataToSend);
      showToast.success(response.data.message || 'Restaurant registered successfully');
      navigate('/restaurant/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Check if it's a file size error
      if (error.response?.status === 413) {
        showToast.error('Image file is too large. Please use a smaller image (less than 1MB).');
      } else {
        showToast.error(error.response?.data?.message || 'Failed to register restaurant');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1024px',
      margin: '0 auto',
      backgroundImage: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
      minHeight: 'calc(100vh - 4rem)'
    }}>
      <div style={{ boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
        <div
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
              <h2 style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '1.25rem' }}>
                Register New Restaurant
              </h2>
              <p style={{ color: 'white', opacity: 0.8, fontSize: '0.875rem' }}>
                Fill in all required fields to register your restaurant
              </p>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '2.5rem', backgroundColor: 'white' }}>
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
              <h3 style={{ color: '#1e40af', fontWeight: '600', marginBottom: '0.25rem', fontSize: '1.125rem' }}>
                Restaurant Information
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Please fill in all required fields. The information will be used to display your restaurant to customers.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Name Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="restaurantName" style={{
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
                    id="restaurantName"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
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
                </div>
                {errors.name && (
                  <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.name}
                  </p>
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
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: errors.description ? '1px solid #ef4444' : '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    color: '#1f2937',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  placeholder="Describe your restaurant"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.description ? '#ef4444' : '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                ></textarea>
                {errors.description && (
                  <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.description}
                  </p>
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
                    style={{
                      width: '100%',
                      padding: '1rem',
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
                  <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.cuisine}
                  </p>
                )}
              </div>
  
              {/* Restaurant Image Field */}
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
                <input
                  type="file"
                  id="restaurantImage"
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: errors.image ? '1px solid #ef4444' : '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    color: '#1f2937',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                />
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
                {errors.image && (
                  <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.image}
                  </p>
                )}
                <p style={{ display: 'block', color: '#6b7280', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  Please use a small image file (less than 1MB) to avoid upload issues.
                </p>
              </div>
  
              {/* Email Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="email" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem',
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
                {errors.email && (
                  <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.email}
                  </p>
                )}
              </div>
  
              {/* Contact Number Field */}
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
                <input
                  id="contactNumber"
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: errors.contactNumber ? '1px solid #ef4444' : '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    color: '#1f2937',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  placeholder="1234567890"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.contactNumber ? '#ef4444' : '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.contactNumber && (
                  <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.contactNumber}
                  </p>
                )}
              </div>
  
              {/* Location Coordinates */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ 
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Location Coordinates
                  </h3>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={locationLoading}
                    style={{ 
                      backgroundColor: '#4CAF50', 
                      color: 'white', 
                      border: 'none',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1.5rem',
                      cursor: locationLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => !locationLoading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => !locationLoading && (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    {locationLoading && <LoadingSpinner size="sm" />}
                    Auto-fill My Location
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="latitude" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Latitude
                    </label>
                    <input
                      id="latitude"
                      type="number"
                      step="any"
                      name="location.latitude"
                      value={formData.location.latitude}
                      onChange={handleChange}
                      placeholder="e.g. 37.7749"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'white',
                        border: errors.latitude ? '1px solid #ef4444' : '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                    />
                    {errors.latitude && (
                      <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                        {errors.latitude}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label htmlFor="longitude" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Longitude
                    </label>
                    <input
                      id="longitude"
                      type="number"
                      step="any"
                      name="location.longitude"
                      value={formData.location.longitude}
                      onChange={handleChange}
                      placeholder="e.g. -122.4194"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'white',
                        border: errors.longitude ? '1px solid #ef4444' : '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                    />
                    {errors.longitude && (
                      <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                        {errors.longitude}
                      </p>
                    )}
                  </div>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Enter the geographic coordinates of your restaurant location or use the auto-fill button to get your current location.
                </p>
              </div>
  
              {/* Address Fields */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ 
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '1rem'
                }}>
                  Address
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="street" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Street
                  </label>
                  <input
                    id="street"
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: 'white',
                      border: errors.street ? '1px solid #ef4444' : '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      color: '#1f2937',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    placeholder="123 Main St"
                  />
                  {errors.street && (
                    <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      {errors.street}
                    </p>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="city" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
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
                    />
                    {errors.city && (
                      <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                        {errors.city}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label htmlFor="state" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      State
                    </label>
                    <input
                      id="state"
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
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
                    />
                    {errors.state && (
                      <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                        {errors.state}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label htmlFor="zipCode" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      ZIP Code
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
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
                      placeholder="12345"
                    />
                    {errors.zipCode && (
                      <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                        {errors.zipCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
  
              {/* Operating Hours */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ 
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '1rem'
                }}>
                  Operating Hours
                </h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="startTime" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Start Time
                    </label>
                    <input
                      id="startTime"
                      type="time"
                      name="operatingHours.startTime"
                      value={formData.operatingHours.startTime}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'white',
                        border: errors.startTime ? '1px solid #ef4444' : '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                    />
                    {errors.startTime && (
                      <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                        {errors.startTime}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label htmlFor="endTime" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      End Time
                    </label>
                    <input
                      id="endTime"
                      type="time"
                      name="operatingHours.endTime"
                      value={formData.operatingHours.endTime}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'white',
                        border: errors.endTime ? '1px solid #ef4444' : '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        color: '#1f2937',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                    />
                    {errors.endTime && (
                      <p style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                        {errors.endTime}
                      </p>
                    )}
                  </div>
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
                <button
                  type="button"
                  onClick={() => navigate('/restaurant/dashboard')}
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
                
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '1rem 3rem',
                    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.1)'
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <LoadingSpinner size="sm" />
                      <span style={{ marginLeft: '0.5rem' }}>Registering...</span>
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
                      Register Restaurant
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterRestaurant;