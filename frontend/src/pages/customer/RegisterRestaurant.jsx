// src/pages/customer/RegisterRestaurant.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Textarea,
  Button,
  Select,
  Option
} from '@material-tailwind/react';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const cuisineTypes = [
  'Italian', 'Chinese', 'Indian', 'American', 'Mexican', 
  'Japanese', 'Thai', 'Mediterranean', 'French', 'Greek', 
  'Korean', 'Vietnamese', 'Middle Eastern', 'Spanish', 'Other'
];

const RegisterRestaurant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
      startTime: '09:00',
      endTime: '22:00'
    },
    cuisine: '',
    image: 'default-restaurant.jpg'
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.description || !formData.cuisine) {
      showToast.error('Please fill all required fields');
      return;
    }
    
    if (!formData.address.street || !formData.address.city || 
        !formData.address.state || !formData.address.zipCode) {
      showToast.error('Please complete the address information');
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.post('/restaurants', formData);
      showToast.success(response.data.message);
      navigate('/customer/dashboard');
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to register restaurant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <Card>
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-4 p-6"
        >
          <Typography variant="h4" color="white">
            Register Your Restaurant
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Restaurant Information
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  size="lg"
                  label="Restaurant Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Select
                  label="Cuisine Type"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={(value) => setFormData(prev => ({ ...prev, cuisine: value }))}
                  required
                >
                  {cuisineTypes.map((cuisine) => (
                    <Option key={cuisine} value={cuisine}>{cuisine}</Option>
                  ))}
                </Select>
              </div>
              <div className="mt-4">
                <Textarea
                  size="lg"
                  label="Restaurant Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Contact Information
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  size="lg"
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  size="lg"
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Address
              </Typography>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  size="lg"
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <Input
                  size="lg"
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                />
                <Input
                  size="lg"
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  required
                />
                <Input
                  size="lg"
                  label="Zip Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Operating Hours
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  size="lg"
                  label="Opening Time"
                  name="operatingHours.startTime"
                  type="time"
                  value={formData.operatingHours.startTime}
                  onChange={handleChange}
                  required
                />
                <Input
                  size="lg"
                  label="Closing Time"
                  name="operatingHours.endTime"
                  type="time"
                  value={formData.operatingHours.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outlined" color="red" onClick={() => navigate('/customer/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" color="blue" disabled={loading}>
                {loading ? 'Registering...' : 'Register Restaurant'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default RegisterRestaurant;