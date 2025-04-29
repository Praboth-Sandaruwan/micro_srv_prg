const { validationResult } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const ERROR_MESSAGES = require('../constants/errorMessages');
const SUCCESS_MESSAGES = require('../constants/successMessages');

// Get all restaurants owned by the current user
const getMyRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id })
      .select('_id name address isVerified')
      .lean();

    if (!restaurants || restaurants.length === 0) {
      return res.status(404).json({ 
        message: ERROR_MESSAGES.NO_RESTAURANTS_FOUND,
        suggestion: "Please register a restaurant first"
      });
    }

    return res.status(200).json(restaurants);
  } catch (error) {
    console.error('Error in getMyRestaurants:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

// Add new menu item (for restaurant owner only)
const addMenuItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), message: ERROR_MESSAGES.VALIDATION_ERROR });
  }

  const { name, description, price, category, restaurantId,image } = req.body;

  try {
    // Find the specific restaurant by ID
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND });
    }

    // Check if the current user is the owner of this restaurant
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
    }

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      restaurant: restaurant._id,
      image: image || 'default-food.jpg'
    });

    return res.status(201).json({
      message: SUCCESS_MESSAGES.MENU_ITEM_ADDED,
      menuItem: {
        ...menuItem.toObject(),
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name
        }
      }
    });
  } catch (error) {
    console.error('Error in addMenuItem:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

// Get all menu items by restaurant ID
const getMenuItemsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND });
    }

    if (
      !restaurant.isVerified &&
      !req.user?.roles.includes('admin') &&
      restaurant.owner.toString() !== req.user?._id.toString()
    ) {
      return res.status(403).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_VERIFIED });
    }

    const menuItems = await MenuItem.find({
      restaurant: restaurantId,
      isAvailable: true
    });

    return res.status(200).json({
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name
      },
      menuItems
    });
  } catch (error) {
    console.error('Error in getMenuItemsByRestaurant:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

// Update menu item (restaurant owner only)
const updateMenuItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), message: ERROR_MESSAGES.VALIDATION_ERROR });
  }

  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: ERROR_MESSAGES.MENU_ITEM_NOT_FOUND });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (!restaurant) {
      return res.status(404).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND });
    }

    // Check if the current user is the owner of this restaurant
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
    }

    const { name, description, price, category, isAvailable,image } = req.body;

    menuItem.name = name || menuItem.name;
    menuItem.description = description || menuItem.description;
    menuItem.price = price !== undefined ? price : menuItem.price;
    menuItem.category = category || menuItem.category;
    menuItem.isAvailable = isAvailable !== undefined ? isAvailable : menuItem.isAvailable;
    menuItem.image = image || menuItem.image; // 👈 Update image

    await menuItem.save();

    return res.status(200).json({
      message: SUCCESS_MESSAGES.MENU_ITEM_UPDATED,
      menuItem: {
        ...menuItem.toObject(),
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name
        }
      }
    });
  } catch (error) {
    console.error('Error in updateMenuItem:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

// Delete menu item (restaurant owner only)
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: ERROR_MESSAGES.MENU_ITEM_NOT_FOUND });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (!restaurant) {
      return res.status(404).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND });
    }

    // Check if the current user is the owner of this restaurant
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    return res.status(200).json({ 
      message: SUCCESS_MESSAGES.MENU_ITEM_DELETED,
      restaurantId: restaurant._id 
    });
  } catch (error) {
    console.error('Error in deleteMenuItem:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};
const getPublicMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND });
    }

    // Customers can only see menus for verified restaurants
    if (!restaurant.isVerified) {
      return res.status(403).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_VERIFIED });
    }

    const menuItems = await MenuItem.find({
      restaurant: restaurantId,
      isAvailable: true  // Only show available items to customers
    });

    // Group menu items by category for better organization
    const menuItemsByCategory = {};
    menuItems.forEach(item => {
      if (!menuItemsByCategory[item.category]) {
        menuItemsByCategory[item.category] = [];
      }
      menuItemsByCategory[item.category].push(item);
    });

    return res.status(200).json({
      menuItemsByCategory,
      categories: Object.keys(menuItemsByCategory)
    });
  } catch (error) {
    console.error('Error in getPublicMenuByRestaurant:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};
// Get menu item details by ID (without restaurant details)
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({ message: ERROR_MESSAGES.MENU_ITEM_NOT_FOUND });
    }

    // Check if the restaurant exists and is verified (for security)
    const restaurant = await Restaurant.findById(menuItem.restaurant);
    
    if (!restaurant) {
      return res.status(404).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_FOUND });
    }

    if (!restaurant.isVerified) {
      return res.status(403).json({ message: ERROR_MESSAGES.RESTAURANT_NOT_VERIFIED });
    }

    // Return only menu item details
    return res.status(200).json({
      menuItem: menuItem.toObject()
    });
  } catch (error) {
    console.error('Get menu item by ID error:', error);
    return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

module.exports = {
  getMyRestaurants,
  addMenuItem,
  getMenuItemsByRestaurant,
  updateMenuItem,
  deleteMenuItem,
  getPublicMenuByRestaurant,
  getMenuItemById
};