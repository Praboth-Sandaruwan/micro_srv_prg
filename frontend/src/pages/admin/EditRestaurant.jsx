import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  HomeIcon,
  PhoneIcon,
  ClockIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const EditRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [errors, setErrors] = useState({});
  
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
      startTime: '',
      endTime: ''
    },
    cuisine: '',
    isOpen: true
  });

  // Cuisine options
  const cuisineOptions = [
    'Italian', 'Chinese', 'Mexican', 'Japanese', 'Indian', 
    'Thai', 'French', 'American', 'Mediterranean', 'Other'
  ];

  useEffect(() => {
    if (id) {
      fetchRestaurantDetails();
    } else {
      setLoading(false);
      showToast.error('Invalid restaurant ID');
      navigate('/admin/restaurants');
    }
  }, [id, navigate]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/restaurants/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      showToast.error('Failed to load restaurant details');
      navigate('/admin/restaurants');
    } finally {
      setLoading(false);
      setFetchAttempted(true);
    }
  };

  const handleInputChange = (e) => {
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

    // Clear error for the field being changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSwitchChange = () => {
    setFormData(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    if (!formData.address.street) newErrors['address.street'] = 'Street address is required';
    if (!formData.address.city) newErrors['address.city'] = 'City is required';
    if (!formData.address.state) newErrors['address.state'] = 'State is required';
    if (!formData.address.zipCode) newErrors['address.zipCode'] = 'Zip code is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.cuisine) newErrors.cuisine = 'Cuisine type is required';
    if (!formData.operatingHours.startTime) newErrors['operatingHours.startTime'] = 'Opening time is required';
    if (!formData.operatingHours.endTime) newErrors['operatingHours.endTime'] = 'Closing time is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await api.put(`/restaurants/${id}`, formData);
      showToast.success('Restaurant updated successfully');
      navigate('/admin/restaurants');
    } catch (error) {
      console.error('Error updating restaurant:', error);
      showToast.error(error.response?.data?.message || 'Failed to update restaurant');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !fetchAttempted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!formData.name && fetchAttempted) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center">
        <div className="shadow-lg p-8 rounded-xl bg-white">
          <h5 className="text-red-500 text-xl font-bold">
            Error loading restaurant
          </h5>
          <p className="mt-4">
            Could not load restaurant information. The restaurant may not exist or you may not have permission to view it.
          </p>
          <button
            onClick={() => navigate('/admin/restaurants')}
            className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Back to Restaurants List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/admin/restaurants')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Restaurants</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 shadow-sm">
                  <HomeIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Edit Restaurant</h2>
                  <p className="opacity-80 text-sm">Update your restaurant details below</p>
                </div>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                formData.isOpen ? 'bg-green-100/20 text-green-50' : 'bg-red-100/20 text-red-50'
              }`}>
                {formData.isOpen ? 'Open' : 'Closed'}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-10">
            <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h6 className="text-blue-800 font-semibold mb-1 text-base">
                  Restaurant Information
                </h6>
                <p className="text-gray-600 text-sm">
                  Please fill in all required fields. The information will be displayed to customers and used for delivery.
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Restaurant Name */}
                <div>
                  <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <HomeIcon className="h-4 w-4 text-blue-500" />
                    Restaurant Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 pl-10 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                      placeholder="Restaurant Name"
                    />
                    <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                
                {/* Cuisine Type */}
                <div>
                  <label htmlFor="cuisine" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <MapPinIcon className="h-4 w-4 text-blue-500" />
                    Cuisine Type
                  </label>
                  <div className="relative">
                    <select
                      id="cuisine"
                      name="cuisine"
                      value={formData.cuisine}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 pl-10 border ${errors.cuisine ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all appearance-none`}
                    >
                      <option value="">Select Cuisine</option>
                      {cuisineOptions.map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.cuisine && (
                    <p className="text-red-500 text-sm mt-1">{errors.cuisine}</p>
                  )}
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <EnvelopeIcon className="h-4 w-4 text-blue-500" />
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 pl-10 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                      placeholder="restaurant@example.com"
                    />
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                
                {/* Contact Number */}
                <div>
                  <label htmlFor="contactNumber" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <PhoneIcon className="h-4 w-4 text-blue-500" />
                    Contact Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 pl-10 border ${errors.contactNumber ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                      placeholder="(123) 456-7890"
                    />
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.contactNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
                  )}
                </div>
                
                {/* Street Address - Full Width */}
                <div className="md:col-span-2">
                  <label htmlFor="address.street" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <MapPinIcon className="h-4 w-4 text-blue-500" />
                    Street Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="address.street"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 pl-10 border ${errors['address.street'] ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                      placeholder="123 Main Street"
                    />
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errors['address.street'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['address.street']}</p>
                  )}
                </div>
                
                {/* City */}
                <div>
                  <label htmlFor="address.city" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <MapPinIcon className="h-4 w-4 text-blue-500" />
                    City
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 pl-10 border ${errors['address.city'] ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                      placeholder="City"
                    />
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errors['address.city'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['address.city']}</p>
                  )}
                </div>
                
                {/* State */}
                <div>
                  <label htmlFor="address.state" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <MapPinIcon className="h-4 w-4 text-blue-500" />
                    State
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 pl-10 border ${errors['address.state'] ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                      placeholder="State"
                    />
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errors['address.state'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['address.state']}</p>
                  )}
                </div>
                
                {/* Zip Code */}
                <div>
                  <label htmlFor="address.zipCode" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <MapPinIcon className="h-4 w-4 text-blue-500" />
                    Zip Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="address.zipCode"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 pl-10 border ${errors['address.zipCode'] ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                      placeholder="Zip Code"
                    />
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errors['address.zipCode'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['address.zipCode']}</p>
                  )}
                </div>
                
                {/* Latitude */}
                <div>
                  <label htmlFor="location.latitude" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <GlobeAltIcon className="h-4 w-4 text-blue-500" />
                    Latitude
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="location.latitude"
                      name="location.latitude"
                      value={formData.location.latitude}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      placeholder="e.g. 40.7128"
                    />
                    <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                {/* Longitude */}
                <div>
                  <label htmlFor="location.longitude" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <GlobeAltIcon className="h-4 w-4 text-blue-500" />
                    Longitude
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="location.longitude"
                      name="location.longitude"
                      value={formData.location.longitude}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      placeholder="e.g. -74.0060"
                    />
                    <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                {/* Opening Time */}
                <div>
                  <label htmlFor="operatingHours.startTime" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <ClockIcon className="h-4 w-4 text-blue-500" />
                    Opening Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      id="operatingHours.startTime"
                      name="operatingHours.startTime"
                      value={formData.operatingHours.startTime}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 pl-10 border ${errors['operatingHours.startTime'] ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                    />
                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errors['operatingHours.startTime'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['operatingHours.startTime']}</p>
                  )}
                </div>
                
                {/* Closing Time */}
                <div>
                  <label htmlFor="operatingHours.endTime" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <ClockIcon className="h-4 w-4 text-blue-500" />
                    Closing Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      id="operatingHours.endTime"
                      name="operatingHours.endTime"
                      value={formData.operatingHours.endTime}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 pl-10 border ${errors['operatingHours.endTime'] ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                    />
                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {errors['operatingHours.endTime'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['operatingHours.endTime']}</p>
                  )}
                </div>
                
                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <PencilSquareIcon className="h-4 w-4 text-blue-500" />
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className={`w-full px-4 py-3 pl-10 border ${errors.description ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                      placeholder="Restaurant description..."
                    />
                    <PencilSquareIcon className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
                
                {/* Status Switch */}
                <div className="flex items-center justify-between md:col-span-2 mt-2">
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isOpen}
                        onChange={handleSwitchChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Restaurant Status ({formData.isOpen ? 'Open' : 'Closed'})
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/restaurants')}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  <XMarkIcon className="h-5 w-5" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRestaurant;