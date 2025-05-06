// src/pages/profile/UserProfile.jsx
import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Avatar,
  Input
} from '@material-tailwind/react';
import { PencilIcon, CheckIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { showToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import api from '../../services/api'; 

const UserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    location: {
      latitude: '',
      longitude: ''
    }
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        location: {
          latitude: user.location?.latitude || '',
          longitude: user.location?.longitude || ''
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested location object
    if (name === 'latitude' || name === 'longitude') {
      setProfileData({
        ...profileData,
        location: {
          ...profileData.location,
          [name]: value
        }
      });
      
      // Clear error when user starts typing
      if (errors.location && errors.location[name]) {
        setErrors({
          ...errors,
          location: {
            ...errors.location,
            [name]: ''
          }
        });
      }
    } else {
      setProfileData({
        ...profileData,
        [name]: value
      });
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: ''
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!profileData.name.trim()) newErrors.name = 'Name is required';
    
    // Enhanced email validation
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
  
    // Enhanced phone number validation
    if (!profileData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(profileData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    
    // Location validation
    newErrors.location = {};
    
    // Latitude validation
    if (profileData.location.latitude === '') {
      newErrors.location.latitude = 'Latitude is required';
    } else {
      const lat = parseFloat(profileData.location.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.location.latitude = 'Latitude must be between -90 and 90';
      }
    }
    
    // Longitude validation
    if (profileData.location.longitude === '') {
      newErrors.location.longitude = 'Longitude is required';
    } else {
      const lng = parseFloat(profileData.location.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.location.longitude = 'Longitude must be between -180 and 180';
      }
    }
    
    // Clean up empty objects
    if (Object.keys(newErrors.location).length === 0) {
      delete newErrors.location;
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      // Convert latitude and longitude to numbers
      const dataToSubmit = {
        ...profileData,
        location: {
          latitude: parseFloat(profileData.location.latitude),
          longitude: parseFloat(profileData.location.longitude)
        }
      };
      
      // 1. Send update request
      const { data } = await api.put(`/users/${user._id}`, dataToSubmit);

      // 2. OPTION A: If your authService.getProfile() updates the context properly
      const updatedUser = await authService.getProfile();
      
      // 3. Update local state to match the response
      setProfileData({
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        location: {
          latitude: updatedUser.location?.latitude || '',
          longitude: updatedUser.location?.longitude || ''
        }
      });

      showToast.success(data.message || 'Profile updated successfully');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    // Reset form data to current user data
    setProfileData({
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      location: {
        latitude: user.location?.latitude || '',
        longitude: user.location?.longitude || ''
      }
    });
    setErrors({});
    setIsEditing(false);
  };

  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getUserInitials = () => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format coordinates to 6 decimal places for display
  const formatCoordinate = (coord) => {
    return typeof coord === 'number' ? coord.toFixed(6) : 'Not set';
  };

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <CardHeader
          floated={false}
          variant="gradient"
          color="blue"
          style={{ 
            padding: '1.5rem',
            margin: '0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#2196f3',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '2rem',
              border: '2px solid white'
            }}
          >
            {getUserInitials()}
          </div>
          <Typography variant="h4" color="white">
            {user?.name}
          </Typography>
        </CardHeader>
        <CardBody style={{ padding: '2rem' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <Input
                  type="text"
                  label="Full Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  size="lg"
                  error={!!errors.name}
                />
                {errors.name && (
                  <Typography
                    variant="small"
                    color="red"
                    style={{ marginTop: '0.25rem' }}
                  >
                    {errors.name}
                  </Typography>
                )}
              </div>

              <div>
                <Input
                  type="email"
                  label="Email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  size="lg"
                  error={!!errors.email}
                />
                {errors.email && (
                  <Typography
                    variant="small"
                    color="red"
                    style={{ marginTop: '0.25rem' }}
                  >
                    {errors.email}
                  </Typography>
                )}
              </div>

              <div>
                <Input
                  type="tel"
                  label="Phone Number"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, '');
                    e.target.value = value; // Update the input value
                    handleChange(e); // Call the original handleChange
                  }}
                  size="lg"
                  error={!!errors.phoneNumber}
                />
                {errors.phoneNumber && (
                  <Typography
                    variant="small"
                    color="red"
                    style={{ marginTop: '0.25rem' }}
                  >
                    {errors.phoneNumber}
                  </Typography>
                )}
              </div>

              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                  style={{ marginBottom: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}
                >
                  Location
                </Typography>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      type="text"
                      label="Latitude"
                      name="latitude"
                      value={profileData.location.latitude}
                      onChange={handleChange}
                      size="lg"
                      error={!!(errors.location && errors.location.latitude)}
                    />
                    {errors.location && errors.location.latitude && (
                      <Typography
                        variant="small"
                        color="red"
                        style={{ marginTop: '0.25rem' }}
                      >
                        {errors.location.latitude}
                      </Typography>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input
                      type="text"
                      label="Longitude"
                      name="longitude"
                      value={profileData.location.longitude}
                      onChange={handleChange}
                      size="lg"
                      error={!!(errors.location && errors.location.longitude)}
                    />
                    {errors.location && errors.location.longitude && (
                      <Typography
                        variant="small"
                        color="red"
                        style={{ marginTop: '0.25rem' }}
                      >
                        {errors.location.longitude}
                      </Typography>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                  style={{ marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}
                >
                  Full Name
                </Typography>
                <Typography variant="paragraph" style={{ color: '#334155' }}>
                  {user?.name}
                </Typography>
              </div>
              
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                  style={{ marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}
                >
                  Email
                </Typography>
                <Typography variant="paragraph" style={{ color: '#334155' }}>
                  {user?.email}
                </Typography>
              </div>
              
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                  style={{ marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}
                >
                  Phone Number
                </Typography>
                <Typography variant="paragraph" style={{ color: '#334155' }}>
                  {user?.phoneNumber}
                </Typography>
              </div>

              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                  style={{ marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}
                >
                  Location
                </Typography>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPinIcon style={{ width: '16px', height: '16px', color: '#64748b' }} />
                  <Typography variant="paragraph" style={{ color: '#334155' }}>
                    Lat: {formatCoordinate(user?.location?.latitude)}, 
                    Long: {formatCoordinate(user?.location?.longitude)}
                  </Typography>
                </div>
              </div>
              
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                  style={{ marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}
                >
                  Account Type
                </Typography>
                <div style={{
                  backgroundColor: 
                    user?.role === 'admin' ? '#3b82f6' : 
                    user?.role === 'restaurant' ? '#10b981' : '#f59e0b',
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  display: 'inline-block',
                  textTransform: 'capitalize'
                }}>
                  {user?.role}
                </div>
              </div>
            </div>
          )}
        </CardBody>
        <CardFooter style={{ padding: '0 2rem 2rem' }}>
          {isEditing ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button
                variant="outlined"
                color="blue-gray"
                onClick={cancelEdit}
              >
                <XMarkIcon style={{ width: '16px', height: '16px', marginRight: '0.25rem' }} />
                Cancel
              </Button>
              <Button
                variant="gradient"
                color="blue"
                onClick={handleSubmit}
                disabled={saving}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem'
                }}
              >
                {saving ? <LoadingSpinner size="sm" /> : <CheckIcon style={{ width: '16px', height: '16px' }} />}
                Save Changes
              </Button>
            </div>
          ) : (
            <Button
              variant="gradient"
              color="blue"
              onClick={() => setIsEditing(true)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem'
              }}
            >
              <PencilIcon style={{ width: '16px', height: '16px' }} />
              Edit Profile
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserProfile;