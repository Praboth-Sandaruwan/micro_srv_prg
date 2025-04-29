// Updated authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const ERROR_MESSAGES = require('../constants/errorMessages');
const SUCCESS_MESSAGES = require('../constants/successMessages');
const httpStatus = require('../constants/httpMessages');

// Updated helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Cookie configuration
const cookieOptions = {
  httpOnly: true,  // Prevents JavaScript access to the cookie
  secure: process.env.NODE_ENV === 'production',  // Only send over HTTPS in production
  sameSite: 'strict',  // Prevents CSRF attacks
  maxAge: 3600000  // 1 hour in milliseconds (matching JWT_EXPIRE)
};

// Register a new user
const register = async (req, res) => {
  // Controller-level validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(httpStatus.BAD_REQUEST).json({ 
      errors: errors.array(), 
      message: ERROR_MESSAGES.VALIDATION_ERROR 
    });
  }

  let { name, email, password, phoneNumber } = req.body;

  try {
    // Standardize email
    email = email.toLowerCase();

    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(httpStatus.BAD_REQUEST).json({ 
        message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS 
      });
    }
    
    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character"
      });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role: 'customer'
    });
    
    return res.status(httpStatus.CREATED).json({
      message: SUCCESS_MESSAGES.USER_REGISTERED
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(httpStatus.SERVER_ERROR).json({ 
      message: ERROR_MESSAGES.SERVER_ERROR 
    });
  }
};

// Login user
const login = async (req, res) => {
  // Controller-level validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(httpStatus.BAD_REQUEST).json({ 
      errors: errors.array(), 
      message: ERROR_MESSAGES.VALIDATION_ERROR 
    });
  }

  let { email, password } = req.body;
  
  try {
    // Standardize email
    email = email.toLowerCase();

    // Find user by email
    const user = await User.findOne({ email });
    
    // Debug
    console.log("Login attempt for:", email);
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ 
        message: ERROR_MESSAGES.INVALID_CREDENTIALS 
      });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch ? "Yes" : "No");
    
    if (!isMatch) {
      return res.status(httpStatus.UNAUTHORIZED).json({ 
        message: ERROR_MESSAGES.INVALID_CREDENTIALS 
      });
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Set token in HTTP-only cookie
    res.cookie('token', token, cookieOptions);
    
    return res.status(httpStatus.SUCCESS).json({
      message: SUCCESS_MESSAGES.USER_LOGGED_IN,
      token // Still returning token in response for backward compatibility
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(httpStatus.SERVER_ERROR).json({ 
      message: ERROR_MESSAGES.SERVER_ERROR 
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ 
        message: ERROR_MESSAGES.UNAUTHORIZED 
      });
    }
    
    return res.status(httpStatus.SUCCESS).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(httpStatus.SERVER_ERROR).json({ 
      message: ERROR_MESSAGES.SERVER_ERROR 
    });
  }
};

// Logout user - now clears the cookie
const logout = (req, res) => {
  // Clear the cookie
  res.clearCookie('token');
  
  return res.status(httpStatus.SUCCESS).json({ 
    message: SUCCESS_MESSAGES.USER_LOGGED_OUT 
  });
};

module.exports = {
  register,
  login,
  getProfile,
  logout
};