// src/pages/profile/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import api from '../../services/api';
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { showToast } from '../../components/ui/Toast';

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
      <div className="flex justify-center items-center h-80vh">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-blue-600 animate-pulse font-medium">Loading your profile...</p>
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header with Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group mb-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">{getUserInitials()}</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{user?.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <div className="bg-gradient-to-r from-blue-600 to-blue-300 text-white text-xs px-3 py-1 rounded-full capitalize font-medium">
              {user?.role || 'User'}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Information</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-blue-300"></div>
              </div>
            </div>
            
            {isEditing ? (
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <UserIcon className="h-4 w-4 text-blue-500" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <EnvelopeIcon className="h-4 w-4 text-blue-500" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <PhoneIcon className="h-4 w-4 text-blue-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, '');
                        e.target.value = value; // Update the input value
                        handleChange(e); // Call the original handleChange
                      }}
                      required
                      className={`w-full px-4 py-2.5 border ${errors.phoneNumber ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1 md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <MapPinIcon className="h-4 w-4 text-blue-500" />
                      Location
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Latitude"
                          name="latitude"
                          value={profileData.location.latitude}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border ${errors.location && errors.location.latitude ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                        />
                        {errors.location && errors.location.latitude && (
                          <p className="text-red-500 text-xs mt-1">{errors.location.latitude}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Longitude"
                          name="longitude"
                          value={profileData.location.longitude}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border ${errors.location && errors.location.longitude ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                        />
                        {errors.location && errors.location.longitude && (
                          <p className="text-red-500 text-xs mt-1">{errors.location.longitude}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-md transition-all duration-300"
                  >
                    {saving ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <CheckIcon className="h-5 w-5" />
                    )}
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-lg font-medium text-gray-800">{user?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-lg font-medium text-gray-800">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <PhoneIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-lg font-medium text-gray-800">{user?.phoneNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <MapPinIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-lg font-medium text-gray-800">
                        Lat: {formatCoordinate(user?.location?.latitude)}, 
                        Long: {formatCoordinate(user?.location?.longitude)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg md:col-span-2">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <ArrowRightOnRectangleIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm text-gray-500 mr-3">Account Type</p>
                      <div className={`
                        ${user?.role === 'admin' ? 'bg-blue-600' : 
                          user?.role === 'restaurant' ? 'bg-green-600' : 'bg-yellow-500'}
                        text-white text-xs px-3 py-1 rounded-full capitalize font-medium
                      `}>
                        {user?.role || 'User'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 mt-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-md transition-all duration-300"
                >
                  <PencilIcon className="h-5 w-5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;