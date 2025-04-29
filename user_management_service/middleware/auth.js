// Updated auth middleware
const jwt = require('jsonwebtoken');
const ERROR_MESSAGES = require('../constants/errorMessages');
const User = require('../models/User');
const httpStatus = require('../constants/httpMessages');

const auth = async (req, res, next) => {
  try {
    // First try to get token from cookie
    let token = req.cookies.token;
    
    // If no cookie token, fall back to header for backward compatibility
    if (!token) {
      token = req.header('Authorization')?.replace('Bearer ', '');
    }
    
    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({ 
        message: ERROR_MESSAGES.UNAUTHORIZED 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.userId) {
      return res.status(httpStatus.UNAUTHORIZED).json({ 
        message: ERROR_MESSAGES.INVALID_TOKEN 
      });
    }
    
    // Check if user exists
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ 
        message: ERROR_MESSAGES.UNAUTHORIZED 
      });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Clear expired cookie
      res.clearCookie('token');
      
      return res.status(httpStatus.UNAUTHORIZED).json({ 
        message: ERROR_MESSAGES.TOKEN_EXPIRED 
      });
    }
    return res.status(httpStatus.UNAUTHORIZED).json({ 
      message: ERROR_MESSAGES.UNAUTHORIZED 
    });
  }
};

module.exports = auth;