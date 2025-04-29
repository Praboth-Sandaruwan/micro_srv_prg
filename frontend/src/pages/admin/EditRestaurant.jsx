// src/pages/admin/EditRestaurant.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Button,
  Textarea,
  Select,
  Option,
  Switch
} from '@material-tailwind/react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const EditRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
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
    isOpen: true
  });

  // Cuisine options
  const cuisineOptions = [
    'Italian', 'Chinese', 'Mexican', 'Japanese', 'Indian', 
    'Thai', 'French', 'American', 'Mediterranean', 'Other'
  ];

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

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
  };

  const handleSwitchChange = () => {
    setFormData(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '70vh' 
      }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '768px',
      margin: '0 auto'
    }}>
      <Card>
        <CardHeader
          floated={false}
          shadow={false}
          style={{ 
            padding: '1.5rem',
            backgroundColor: '#f8fafc'
          }}
        >
          <Typography variant="h4">Edit Restaurant</Typography>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardBody style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Basic Information */}
            <Typography variant="h6" color="blue">Basic Information</Typography>
            
            <Input
              label="Restaurant Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            
            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            
            {/* Address Information */}
            <Typography variant="h6" color="blue">Address</Typography>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <Input
                label="Street"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                required
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  required
                />
                
                <Input
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <Input
                label="Zip Code"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Contact Information */}
            <Typography variant="h6" color="blue">Contact Information</Typography>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Phone Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
              />
              
              <Input
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Operating Information */}
            <Typography variant="h6" color="blue">Operating Information</Typography>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                type="time"
                label="Opening Time"
                name="operatingHours.startTime"
                value={formData.operatingHours.startTime}
                onChange={handleInputChange}
                required
              />
              
              <Input
                type="time"
                label="Closing Time"
                name="operatingHours.endTime"
                value={formData.operatingHours.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <Select
                  label="Cuisine Type"
                  value={formData.cuisine}
                  onChange={(value) => setFormData(prev => ({ ...prev, cuisine: value }))}
                  required
                >
                  {cuisineOptions.map(cuisine => (
                    <Option key={cuisine} value={cuisine}>{cuisine}</Option>
                  ))}
                </Select>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginTop: '1rem'
              }}>
                <Switch
                  color="blue"
                  checked={formData.isOpen}
                  onChange={handleSwitchChange}
                  label="Currently Open"
                />
              </div>
            </div>
          </CardBody>
          
          <CardFooter style={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            padding: '1.5rem'
          }}>
            <Button 
              variant="outlined" 
              color="red" 
              onClick={() => navigate('/admin/restaurants')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              color="blue" 
              disabled={submitting}
            >
              {submitting ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LoadingSpinner size="sm" /> Saving...
                </div>
              ) : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditRestaurant;