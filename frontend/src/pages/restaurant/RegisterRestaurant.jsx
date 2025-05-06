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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: '20px' }}></div>
      <div style={{ padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', marginBottom: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: 'bold', color: 'black', fontSize: '20px' }}>Register New Restaurant</h2>
        <div>
          <div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginTop: '5px', marginBottom: '15px' }}>
                <label htmlFor="restaurantName">Restaurant Name</label>
                <input
                  id="restaurantName"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', marginBottom: '5px' }}
                />
                {errors.name && <span style={{ color: 'red', fontSize: '12px' }}>{errors.name}</span>}
              </div>
              
              <div style={{ marginTop: '5px', marginBottom: '15px' }}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', marginBottom: '15px' }}
                ></textarea>
                {errors.description && <span style={{ color: 'red', fontSize: '12px' }}>{errors.description}</span>}
              </div>
              
              <div style={{ marginTop: '5px', marginBottom: '15px' }}>
                <label htmlFor="cuisine">Cuisine Type</label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="cuisine"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={(e) => handleCuisineChange(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', marginBottom: '5px' }}
                  >
                    <option value="">Select Cuisine Type</option>
                    {cuisineTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                {errors.cuisine && <span style={{ color: 'red', fontSize: '12px' }}>{errors.cuisine}</span>}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ marginBottom: '10px' }}>Restaurant Image</h3>
                <input
                  type="file"
                  id="restaurantImage"
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
                {errors.image && <span style={{ color: 'red', fontSize: '12px' }}>{errors.image}</span>}
                <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>
                  Please use a small image file (less than 1MB) to avoid upload issues.
                </small>
              </div>

              <div style={{ marginTop: '5px', marginBottom: '15px' }}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', marginBottom: '5px' }}
                />
                {errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{errors.email}</span>}
              </div>
              
              <div style={{ marginTop: '5px', marginBottom: '15px' }}>
                <label htmlFor="contactNumber">Contact Number</label>
                <input
                  id="contactNumber"
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', marginBottom: '5px' }}
                />
                {errors.contactNumber && <span style={{ color: 'red', fontSize: '12px' }}>{errors.contactNumber}</span>}
              </div>

              <div style={{ marginTop: '5px', marginBottom: '15px' }}>
                <h3 style={{ marginBottom: '10px' }}>Location Coordinates</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span>Enter coordinates or use auto-fill:</span>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={locationLoading}
                    style={{ 
                      backgroundColor: '#4CAF50', 
                      color: 'white', 
                      border: 'none',
                      borderRadius: '5px',
                      padding: '8px 15px',
                      cursor: locationLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {locationLoading && <LoadingSpinner size="sm" />}
                    Auto-fill My Location
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ flex: '1 1 45%' }}>
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      id="latitude"
                      type="number"
                      step="any"
                      name="location.latitude"
                      value={formData.location.latitude}
                      onChange={handleChange}
                      placeholder="e.g. 37.7749"
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', marginBottom: '5px' }}
                    />
                    {errors.latitude && <span style={{ color: 'red', fontSize: '12px' }}>{errors.latitude}</span>}
                  </div>
                  
                  <div style={{ flex: '1 1 45%' }}>
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      id="longitude"
                      type="number"
                      step="any"
                      name="location.longitude"
                      value={formData.location.longitude}
                      onChange={handleChange}
                      placeholder="e.g. -122.4194"
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', marginBottom: '5px' }}
                    />
                    {errors.longitude && <span style={{ color: 'red', fontSize: '12px' }}>{errors.longitude}</span>}
                  </div>
                </div>
                <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>
                  Enter the geographic coordinates of your restaurant location or use the auto-fill button to get your current location.
                </small>
              </div>

              <div style={{ marginTop: '5px', marginBottom: '15px' }}>
                <label htmlFor="street">Street</label>
                <input
                  id="street"
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', marginBottom: '5px' }}
                />
                {errors.street && <span style={{ color: 'red', fontSize: '12px' }}>{errors.street}</span>}
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: '1 1 30%' }}>
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', marginBottom: '5px', fontSize: 'small' }}
                  />
                  {errors.city && <span style={{ color: 'red', fontSize: '12px' }}>{errors.city}</span>}
                </div>
                
                <div style={{ flex: '1 1 30%' }}>
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', marginBottom: '5px', fontSize: 'small' }}
                  />
                  {errors.state && <span style={{ color: 'red', fontSize: '12px' }}>{errors.state}</span>}
                </div>
                
                <div style={{ flex: '1 1 30%' }}>
                  <label htmlFor="zipCode">ZIP Code</label>
                  <input
                    id="zipCode"
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', marginBottom: '5px', fontSize: 'small' }}
                  />
                  {errors.zipCode && <span style={{ color: 'red', fontSize: '12px' }}>{errors.zipCode}</span>}
                </div>
              </div>

              <div style={{ marginTop: '5px', marginBottom: '15px' }}>
                <h3 style={{ marginBottom: '10px' }}>Operating Hours</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ flex: '1 1 45%' }}>
                    <label htmlFor="startTime">Start Time</label>
                    <input
                      id="startTime"
                      type="time"
                      name="operatingHours.startTime"
                      value={formData.operatingHours.startTime}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', marginBottom: '5px' }}
                    />
                    {errors.startTime && <span style={{ color: 'red', fontSize: '12px' }}>{errors.startTime}</span>}
                  </div>
                  
                  <div style={{ flex: '1 1 45%' }}>
                    <label htmlFor="endTime">End Time</label>
                    <input
                      id="endTime"
                      type="time"
                      name="operatingHours.endTime"
                      value={formData.operatingHours.endTime}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px', marginBottom: '5px' }}
                    />
                    {errors.endTime && <span style={{ color: 'red', fontSize: '12px' }}>{errors.endTime}</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/restaurant/dashboard')}
                  style={{ backgroundColor: '#d3d3d3', color: '#000', borderRadius: '5px', padding: '10px 20px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: '#248FDD', color: '#fff', borderRadius: '5px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  {loading && <LoadingSpinner size="sm" />}
                  Register Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterRestaurant;