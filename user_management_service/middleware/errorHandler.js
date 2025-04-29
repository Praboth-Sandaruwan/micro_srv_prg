const { SERVER_ERROR } = require('../constants/httpMessages');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.status || SERVER_ERROR;
  const message = err.message || 'Something went wrong';
  
  res.status(status).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;