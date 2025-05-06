// controllers/userController.js
const { validationResult } = require('express-validator');
const User = require('../models/User');
const ERROR_MESSAGES = require('../constants/errorMessages');
const SUCCESS_MESSAGES = require('../constants/successMessages');
const httpStatus = require('../constants/httpMessages');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    return res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};


// Get user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

// Update user (self or admin)
const updateUser = async (req, res) => {
  // Controller-level validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(httpStatus.BAD_REQUEST).json({ 
      errors: errors.array(), 
      message: ERROR_MESSAGES.VALIDATION_ERROR 
    });
  }

  try {
    // Check if the user exists
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    
    // Check if current user is authorized to update
    if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(httpStatus.FORBIDDEN).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
    }
    
    const { name, email, phoneNumber, location  } = req.body;
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phoneNumber) user.phoneNumber = phoneNumber;
    // Update location if provided
    if (location && location.latitude !== undefined && location.longitude !== undefined) {
      user.location = {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude)
      };
    }
    
    await user.save();
    
    return res.status(httpStatus.SUCCESS).json({
      message: SUCCESS_MESSAGES.USER_UPDATED,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(httpStatus.SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

// Delete user (self or admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    
    // Check if current user is authorized to delete
    if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(httpStatus.FORBIDDEN).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
    }
    
    // Permanently delete the user
    await User.findByIdAndDelete(req.params.id);
    
    return res.status(httpStatus.SUCCESS).json({ message: SUCCESS_MESSAGES.USER_DELETED });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(httpStatus.SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
 
};