// src/pages/admin/EditUser.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Typography, 
  Button
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <Typography variant="h5" color="white" style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                Edit User Profile
              </Typography>
              <Typography variant="small" color="white" style={{ opacity: 0.8 }}>
                Update user information and preferences
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
                Personal Information
              </Typography>
              <Typography variant="small" style={{ color: '#6b7280' }}>
                Please fill in all required fields. The information will be used to identify the user in the system.
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
                  Name
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
                    placeholder="Full Name"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {errors.name && (
                  <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.name}
                  </Typography>
                )}
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
                    placeholder="you@example.com"
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
                <label htmlFor="phoneNumber" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Phone Number
                </label>
                <div style={{
                  position: 'relative',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      backgroundColor: 'white',
                      border: errors.phoneNumber ? '1px solid #ef4444' : '1px solid #e5e7eb',
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
                      e.target.style.borderColor = errors.phoneNumber ? '#ef4444' : '#e5e7eb';
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
                {errors.phoneNumber && (
                  <Typography variant="small" style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {errors.phoneNumber}
                  </Typography>
                )}
              </div>

              {/* Role Dropdown */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="role" style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Role
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
                    <span>Permission level</span>
                  </div>
                </div>
                <div style={{
                  position: 'relative',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
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
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="customer">Customer</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
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
                    onClick={() => navigate('/admin/users')}
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
                      <span style={{ marginLeft: '0.5rem' }}>Updating...</span>
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

      {/* Add animation styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EditUser;