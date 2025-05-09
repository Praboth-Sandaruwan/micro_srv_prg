// routes/restaurants.js
const express = require('express');
const { check } = require('express-validator');
const restaurantController = require('../controllers/restaurantController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

const router = express.Router();

// @route   POST api/restaurants
// @desc    Register a new restaurant
// @access  Private
router.post(
  '/',
  auth,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('address', 'Address is required').isObject(),
    check('address.street', 'Street is required').not().isEmpty(),
    check('address.city', 'City is required').not().isEmpty(),
    check('address.state', 'State is required').not().isEmpty(),
    check('address.zipCode', 'Zip code is required').not().isEmpty(),
    check('contactNumber', 'Contact number is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('operatingHours', 'Operating hours are required').isObject(),
    check('operatingHours.startTime', 'Start time is required').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    check('operatingHours.endTime', 'End time is required').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    check('cuisine', 'Cuisine is required').not().isEmpty()
  ],
  restaurantController.registerRestaurant
);

// @route   GET api/restaurants
// @desc    Get all restaurants
// @access  Public
router.get('/', restaurantController.getAllRestaurants);

// @route   GET api/restaurants/:id
// @desc    Get restaurant by ID
// @access  Public
router.get('/:id', restaurantController.getRestaurantById);

// @route   GET api/restaurants/pending/all
// @desc    Get all pending restaurants
// @access  Private/Admin
router.get('/pending/all', auth, checkRole('admin'), restaurantController.getPendingRestaurants);

// @route   PUT api/restaurants/:id/verify
// @desc    Verify restaurant
// @access  Private/Admin
router.put('/:id/verify', auth, checkRole('admin'), restaurantController.verifyRestaurant);

// @route   PUT api/restaurants/:id
// @desc    Update restaurant
// @access  Private/Restaurant Owner or Admin
router.put(
  '/:id',
  auth,
  checkRole('restaurant', 'admin'),
  [
    check('name', 'Name is required').optional(),
    check('description', 'Description is required').optional(),
    check('address', 'Address is required').optional().isObject(),
    check('contactNumber', 'Contact number is required').optional(),
    check('email', 'Please include a valid email').optional().isEmail(),
    check('operatingHours', 'Operating hours are required').optional().isObject(),
    check('cuisine', 'Cuisine is required').optional(),
    check('isOpen', 'isOpen must be a boolean').optional().isBoolean()
  ],
  restaurantController.updateRestaurant
);

// @route   GET api/restaurants/user/me
// @desc    Get restaurants owned by current user
// @access  Private/Restaurant Owner or Customer
router.get('/user/me', auth, checkRole('restaurant', 'customer'), restaurantController.getMyRestaurants);
// @route   DELETE api/restaurants/:id
// @desc    Delete restaurant
// @access  Private/Restaurant Owner or Admin
router.delete('/:id', auth, checkRole('restaurant', 'admin'), restaurantController.deleteRestaurant);

module.exports = router;