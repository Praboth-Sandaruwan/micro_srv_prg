const ERROR_MESSAGES = {
    // Auth
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    TOKEN_EXPIRED: 'Token has expired',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    
    // Restaurant
    RESTAURANT_NOT_FOUND: 'Restaurant not found',
    RESTAURANT_ALREADY_REGISTERED: 'Restaurant already registered',
    RESTAURANT_NOT_VERIFIED: 'Restaurant is not verified yet',
    NO_RESTAURANTS_FOUND: 'No restaurants found for this user',
    

    // Menu
    MENU_ITEM_NOT_FOUND: 'Menu item not found',
    
    // Orders
    ORDER_NOT_FOUND: 'Order not found',
    
    // Users
    USER_NOT_FOUND: 'User not found',
    
    // Validation
    VALIDATION_ERROR: 'Validation error',
    
    // Server
    SERVER_ERROR: 'Server error, please try again later'
  };
  
  module.exports = ERROR_MESSAGES;