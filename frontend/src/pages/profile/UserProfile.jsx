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
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    setSaving(true);
    // 1. Send update request
    const { data } = await api.put(`/users/${user._id}`, profileData);

    // 2. OPTION A: If your authService.getProfile() updates the context properly
    const updatedUser = await authService.getProfile();
    
    // 3. Update local state to match the response
    setProfileData({
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber
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
      phoneNumber: user.phoneNumber || ''
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