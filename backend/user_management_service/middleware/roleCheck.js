const ERROR_MESSAGES = require('../constants/errorMessages');

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
    }
    
    const hasRole = roles.includes(req.user.role);
    
    if (!hasRole) {
      return res.status(403).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
    }
    
    next();
  };
};

module.exports = checkRole;