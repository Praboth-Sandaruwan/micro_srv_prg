// controllers/restaurantController.js
const { validationResult } = require('express-validator');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const ERROR_MESSAGES = require('../constants/errorMessages');
const SUCCESS_MESSAGES = require('../constants/successMessages');

// Register a new restaurant (for customers)
const registerRestaurant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), message: ERROR_MESSAGES.VALIDATION_ERROR });
  }

  const { 
    name, 
    description, 
    address, 
    contactNumber, 
    email, 
    operatingHours, 
    cuisine,
    location, // Extract location field
    image 
  } = req.body;

  // Validate location data is present
  if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    return res.status(400).json({ message: 'Valid location coordinates are required' });
  }

  try {
    const restaurantExists = await Restaurant.findOne({ 
      name, 
      'address.street': address.street,
      'address.city': address.city
    });
    
    if (restaurantExists) {
      return res.status(400).json({ message: ERROR_MESSAGES.RESTAURANT_ALREADY_REGISTERED });
    }
    
    const restaurant = await Restaurant.create({
      name,
      description,
      address,
      contactNumber,
      email,
      owner: req.user._id,
      operatingHours,
      cuisine,
      location, // Include location in restaurant creation
      image: image || 'default-restaurant.jpg',
      isVerified: false,
      status: 'pending'
    });
    
    if (restaurant) {
      return res.status(201).json({
        message: SUCCESS_MESSAGES.RESTAURANT_REGISTERED,
        restaurant,
        statusMessage: 'Your restaurant registration is pending approval'
      });
    }
  } catch (error) {
    console.error('Restaurant registration error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

// Get all restaurants (for customers)
const getAllRestaurants = async (req, res) => {
  try {
    // Find all verified restaurants (remove time and open status filters)
    const restaurants = await Restaurant.find({ 
      isVerified: true // Keep this if you still only want verified restaurants
    }).populate('owner', 'name');
    
    return res.status(200).json(restaurants);
  } catch (error) {
    console.error('Get all restaurants error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};
// Get restaurant by ID (for customers)
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name');
    
    if (!restaurant) {
      return res.status(404).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND });
    }
    
    if (!restaurant.isVerified) {
      return res.status(403).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_VERIFIED });
    }
    
    // Get current time
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    // Check if restaurant is currently open
    const isWithinHours = restaurant.operatingHours.startTime <= currentTime && 
                         restaurant.operatingHours.endTime >= currentTime;
    
    if (!restaurant.isOpen || !isWithinHours) {
      return res.status(200).json({
        ...restaurant.toObject(),
        currentlyOpen: false
      });
    }
    
    return res.status(200).json({
      ...restaurant.toObject(),
      currentlyOpen: true
    });
  } catch (error) {
    console.error('Get restaurant by ID error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

// Get restaurants pending verification (for admin)
const getPendingRestaurants = async (req, res) => {
  try {
    const pendingRestaurants = await Restaurant.find({ isVerified: false })
      .populate('owner', 'name email phoneNumber');
    
    return res.status(200).json(pendingRestaurants);
  } catch (error) {
    console.error('Get pending restaurants error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

// Verify restaurant (for admin)
const verifyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND });
    }
    
    // Update restaurant verification status
    restaurant.isVerified = true;
    restaurant.status = 'verified'; // Add this line to update the status
    await restaurant.save();
    
    // Update owner's role to 'restaurant'
    const owner = await User.findById(restaurant.owner);
    
    if (owner && owner.role !== 'restaurant') {
      owner.role = 'restaurant';
      await owner.save();
    }
    
    return res.status(200).json({ 
      message: SUCCESS_MESSAGES.RESTAURANT_VERIFIED,
      restaurant
    });
  } catch (error) {
    console.error('Verify restaurant error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

// Update restaurant details (for restaurant owner)
const updateRestaurant = async (req, res) => {
  // Controller-level validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), message: ERROR_MESSAGES.VALIDATION_ERROR });
  }

  try {
    let restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND });
    }
    
    // Check if the current user is the restaurant owner
    if (restaurant.owner.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
    }
    
    const { 
      name, 
      description, 
      address, 
      location,
      contactNumber, 
      email, 
      operatingHours, 
      cuisine,
      isOpen,
      image  
    } = req.body;
    
    // Update restaurant details
    restaurant.name = name || restaurant.name;
    restaurant.description = description || restaurant.description;
    
    // Update address if provided
    if (address) {
      restaurant.address.street = address.street || restaurant.address.street;
      restaurant.address.city = address.city || restaurant.address.city;
      restaurant.address.state = address.state || restaurant.address.state;
      restaurant.address.zipCode = address.zipCode || restaurant.address.zipCode;
    }
    
    // Update location if provided
    if (location) {
      restaurant.location.latitude = location.latitude || restaurant.location.latitude;
      restaurant.location.longitude = location.longitude || restaurant.location.longitude;
    }
    
    restaurant.contactNumber = contactNumber || restaurant.contactNumber;
    restaurant.email = email || restaurant.email;
    
    // Update operating hours if provided
    if (operatingHours) {
      restaurant.operatingHours.startTime = operatingHours.startTime || restaurant.operatingHours.startTime;
      restaurant.operatingHours.endTime = operatingHours.endTime || restaurant.operatingHours.endTime;
    }
    
    restaurant.cuisine = cuisine || restaurant.cuisine;
    restaurant.isOpen = isOpen !== undefined ? isOpen : restaurant.isOpen;
    restaurant.image = image || restaurant.image;
    
    const updatedRestaurant = await restaurant.save();
    
    return res.status(200).json({
      message: SUCCESS_MESSAGES.RESTAURANT_UPDATED,
      restaurant: updatedRestaurant
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};
// Delete restaurant (for restaurant owner or admin)
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND });
    }
    
    // Check if the user is the owner or admin
    if (restaurant.owner.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
    }
    
    // First delete all menu items associated with the restaurant
    await MenuItem.deleteMany({ restaurant: req.params.id });
    
    // Then delete the restaurant
    await Restaurant.findByIdAndDelete(req.params.id);
    
    return res.status(200).json({ 
      message: SUCCESS_MESSAGES.RESTAURANT_DELETED
    });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};


// Get restaurants owned by current user (for restaurant owner)
const getMyRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    
    // Return the restaurants as an array, even if empty
    return res.status(200).json(restaurants);
    
  } catch (error) {
    console.error('Get my restaurants error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};
module.exports = {
  registerRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getPendingRestaurants,
  verifyRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurants
};