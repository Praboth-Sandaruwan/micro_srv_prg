const express = require('express');
const { check } = require('express-validator');
const menuController = require('../controllers/menuController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

const router = express.Router();

// @route   GET api/menu/my-restaurants
// @desc    Get all restaurants owned by current user
// @access  Private/Restaurant Owner
router.get('/my-restaurants', auth, checkRole('restaurant'), menuController.getMyRestaurants);

// @route   POST api/menu
// @desc    Add new menu item
// @access  Private/Restaurant Owner
router.post(
  '/',
  auth,
  checkRole('restaurant'),
  [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('price', 'Price is required')
      .isNumeric()
      .withMessage('Price must be a number')
      .custom((value) => {
        if (value < 0) {
          throw new Error('Price cannot be negative');
        }
        return true;
      }),
    check('category', 'Category is required').not().isEmpty(),
    check('restaurantId', 'Restaurant ID is required').not().isEmpty(),
  ],
  menuController.addMenuItem
);

// @route   GET api/menu/restaurant/:restaurantId
// @desc    Get all menu items for a restaurant
// @access  Public/Private depending on restaurant verification status
router.get('/restaurant/:restaurantId', menuController.getMenuItemsByRestaurant);

// @route   GET api/menu/public/restaurant/:restaurantId
// @desc    Public endpoint to get restaurant menu without authentication
// @access  Public
router.get('/public/restaurant/:restaurantId', menuController.getPublicMenuByRestaurant);

// @route   GET api/menu/:id
// @desc    Get details for a specific menu item
// @access  Public
router.get('/:id', menuController.getMenuItemById);

// @route   PUT api/menu/:id
// @desc    Update a menu item
// @access  Private/Restaurant Owner
router.put(
  '/:id',
  auth,
  checkRole('restaurant'),
  [
    check('name', 'Name is required').optional(),
    check('description', 'Description is required').optional(),
    check('price', 'Price is required')
      .isNumeric()
      .withMessage('Price must be a number')
      .custom((value) => {
        if (value < 0) {
          throw new Error('Price cannot be negative');
        }
        return true;
      }),
    check('category', 'Category is required').optional(),
    check('isAvailable', 'isAvailable must be a boolean').optional().isBoolean()
  ],
  menuController.updateMenuItem
);

// @route   DELETE api/menu/:id
// @desc    Delete a menu item
// @access  Private/Restaurant Owner
router.delete('/:id', auth, checkRole('restaurant'), menuController.deleteMenuItem);

module.exports = router;