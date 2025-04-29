// src/pages/admin/EditUser.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Typography, 
  Button,
  Input
} from '@material-tailwind/react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const EditUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'customer'
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL params

  // Use a separate flag to track if we've attempted to fetch
  const [fetchAttempted, setFetchAttempted] = useState(false);

  useEffect(() => {
    // Only fetch if we have an ID
    if (id) {
      fetchUser();
    } else {
      setLoading(false);
      showToast.error('Invalid user ID');
      navigate('/admin/users');
    }
  }, [id, navigate]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      console.log("Making API request to fetch user:", id);
  
      const response = await api.get(`/users/${id}`); // Using axios instance
      const data = response.data;
      console.log("User data received:", data);
  
      setUser(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        role: data.role || 'customer'
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      showToast.error(error.response?.data?.message || 'Failed to load user');
    } finally {
      setLoading(false);
      setFetchAttempted(true);
    }
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    try {
      setLoading(true);
      console.log("Submitting update for user:", id);
  
      await api.put(`/users/${id}`, formData); // Using axios instance
  
      showToast.success('User updated successfully');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error updating user:', error);
      showToast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };
  

  // Show loading only before fetch attempt
  if (loading && !fetchAttempted) {
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

  // Show error if no user after fetch attempt
  if (!user && fetchAttempted) {
    return (
      <div style={{
        padding: '2rem',
        maxWidth: '1280px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
          <Typography variant="h5" color="red">
            Error loading user
          </Typography>
          <Typography variant="paragraph" style={{ marginTop: '1rem' }}>
            Could not load user information. The user may not exist or you may not have permission to view it.
          </Typography>
          <Button
            color="blue"
            onClick={() => navigate('/admin/users')}
            style={{ marginTop: '1.5rem' }}
          >
            Back to Users List
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1280px',
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
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h5" color="white">
            Edit User
          </Typography>
        </CardHeader>
        <CardBody style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <Input
                  type="text"
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  size="lg"
                  error={!!errors.name}
                />
                {errors.name && (
                  <Typography variant="small" color="red" style={{ marginTop: '0.25rem' }}>
                    {errors.name}
                  </Typography>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  size="lg"
                  error={!!errors.email}
                />
                {errors.email && (
                  <Typography variant="small" color="red" style={{ marginTop: '0.25rem' }}>
                    {errors.email}
                  </Typography>
                )}
              </div>
              <div>
                <Input
                  type="tel"
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  size="lg"
                  error={!!errors.phoneNumber}
                />
                {errors.phoneNumber && (
                  <Typography variant="small" color="red" style={{ marginTop: '0.25rem' }}>
                    {errors.phoneNumber}
                  </Typography>
                )}
              </div>
              <div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="customer">Customer</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button
                  type="submit"
                  color="blue"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Update User'}
                </Button>
                <Button
                  color="gray"
                  onClick={() => navigate('/admin/users')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default EditUser;