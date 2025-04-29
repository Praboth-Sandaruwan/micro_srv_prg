// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Input, Button, Card, CardHeader, CardBody, CardFooter, Typography } from '@material-tailwind/react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      await login(formData);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#ffffff' 
    }}>
      <Card style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '2rem', 
        borderRadius: '1rem', 
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)', 
        border: '1px solid #e0e0e0' 
      }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <Typography variant="h4" style={{ fontWeight: '600', color: '#111827' }}>
            Welcome Back
          </Typography>
          <Typography variant="small" style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Sign in to your account
          </Typography>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.5rem', 
                color: '#374151' 
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#f9fafb'
                }}
              />
              {errors.email && (
                <Typography variant="small" color="red" style={{ marginTop: '0.25rem' }}>
                  {errors.email}
                </Typography>
              )}
            </div>
  
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.5rem', 
                color: '#374151' 
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#f9fafb'
                }}
              />
              {errors.password && (
                <Typography variant="small" color="red" style={{ marginTop: '0.25rem' }}>
                  {errors.password}
                </Typography>
              )}
            </div>
          </div>
  
          <Button
            type="submit"
            fullWidth
            variant="filled"
            disabled={loading}
            style={{
              marginTop: '2rem',
              padding: '0.75rem',
              backgroundColor: '#111827',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '1rem',
              borderRadius: '0.5rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.3s ease',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#000000'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111827'}
          >
            {loading ? <LoadingSpinner size="sm" /> : null}
            Sign In
          </Button>
        </form>
  
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Typography variant="small" style={{ color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link 
              to="/register" 
              style={{ color: '#111827', fontWeight: '600', textDecoration: 'underline' }}
            >
              Sign Up
            </Link>
          </Typography>
        </div>
      </Card>
    </div>
  );
  
};

export default LoginPage;