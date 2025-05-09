// routes/users.js
const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

const router = express.Router();

// @route   GET api/users
// @desc    Get all users
// @access  Private/Admin
// router.get('/', auth, checkRole('admin'), userController.getAllUsers);
router.get('/', userController.getAllUsers); //for testing purposes

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', auth, checkRole('admin'), userController.getUserById);

// @route   PUT api/users/:id
// @desc    Update user
// @access  Private (self or admin)
router.put(
  '/:id',
  auth,
  [
    check('name', 'Name is required').optional(),
    check('email', 'Please include a valid email').optional().isEmail(),
    check('phoneNumber', 'Phone number is required').optional()
  ],
  userController.updateUser
);

// @route   DELETE api/users/:id
// @desc    Delete user
// @access Private/Admin
router.delete('/:id', auth, checkRole('admin'), userController.deleteUser);


// @route   GET api/users/dd/:id
// @desc    Get user by ID for delivery dashboard(test)
// @access  public
router.get('/dd/:id', userController.getUserById);

module.exports = router;