// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Input, Button, Card, CardHeader, CardBody, CardFooter, Typography } from '@material-tailwind/react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
    }
    
    // Phone number validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      await register(formData);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-md border border-gray-200">
        {/* Header */}
        <div className="text-center py-8 px-6">
          <h2 className="text-3xl font-bold tracking-tight text-[#121212]">
            Create Account
          </h2>
        </div>
  
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-[#121212] mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-black text-[#121212]`}
                placeholder=" Enter Name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
  
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#121212] mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-black text-[#121212]`}
                placeholder="example@domain.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
  
            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#121212] mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-black text-[#121212]`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
  
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-[#121212] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-black text-[#121212]`}
                placeholder="+1 123 456 7890"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
              )}
            </div>
          </div>
  
          {/* Footer */}
          <div className="px-8 pb-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-[#333333] text-white font-semibold py-3 rounded-md transition-all duration-200 flex justify-center items-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              Register
            </button>
  
            <p className="text-sm text-center text-[#121212] mt-4">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-black hover:underline font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default RegisterPage;