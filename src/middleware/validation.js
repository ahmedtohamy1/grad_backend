const { APIError } = require('./errorHandler');

/**
 * Validates that the request body is not empty
 */
const validateRequestBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new APIError('Request body is empty', 400));
  }
  next();
};

/**
 * Validates if a numeric ID parameter is valid
 * @param {String} paramName - The parameter name to validate
 */
const validateIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return next(new APIError(`${paramName} parameter is required`, 400));
    }
    
    if (isNaN(parseInt(id))) {
      return next(new APIError(`${paramName} must be a valid number`, 400));
    }
    
    next();
  };
};

/**
 * Validates car control action value
 */
const validateCarControlAction = (req, res, next) => {
  const { action } = req.body;
  
  if (!action) {
    return next(new APIError('Action is required', 400));
  }
  
  const actionNum = parseInt(action);
  if (isNaN(actionNum) || actionNum < 5 || actionNum > 9) {
    return next(new APIError('Action must be a number between 5 and 9', 400));
  }
  
  next();
};

/**
 * Validates camera control status value
 */
const validateCameraControlStatus = (req, res, next) => {
  const { status } = req.body;
  
  if (!status) {
    return next(new APIError('Status code is required', 400));
  }
  
  // Convert to number if it's a string
  const statusCode = typeof status === 'string' ? parseInt(status) : status;
  
  // Validate status is one of the allowed codes
  if (isNaN(statusCode) || ![11, 12, 13, 14, 15, 16].includes(statusCode)) {
    return next(new APIError('Status code must be one of: 11, 12, 13, 14, 15, 16', 400));
  }
  
  next();
};

/**
 * Validates location data
 */
const validateLocationData = (req, res, next) => {
  const { latitude, longitude, status } = req.body;
  
  if (!latitude) {
    return next(new APIError('Latitude is required', 400));
  }
  
  if (!longitude) {
    return next(new APIError('Longitude is required', 400));
  }
  
  if (!status) {
    return next(new APIError('Status is required', 400));
  }
  
  // Validate latitude/longitude format - only check if they are numbers
  const latNum = parseFloat(latitude);
  const lonNum = parseFloat(longitude);
  
  if (isNaN(latNum) || isNaN(lonNum)) {
    return next(new APIError('Latitude and longitude must be valid numbers', 400));
  }
  
  // Range validation removed - allowing any numeric values
  
  next();
};

/**
 * Validates hardware authentication status value
 */
const validateHwAuthStatus = (req, res, next) => {
  const { status } = req.body;
  
  if (status === undefined || status === null) {
    return next(new APIError('Authentication status is required', 400));
  }
  
  // Convert to number if it's a string
  const statusCode = typeof status === 'string' ? parseInt(status) : status;
  
  // Validate status is either 0 or 1
  if (isNaN(statusCode) || ![0, 1].includes(statusCode)) {
    return next(new APIError('Authentication status must be either 0 or 1', 400));
  }
  
  next();
};

/**
 * Validates user registration data
 */
const validateRegistration = (req, res, next) => {
  const { email, password, name, type } = req.body;
  
  // Check required fields
  if (!email) return next(new APIError('Email is required', 400));
  if (!password) return next(new APIError('Password is required', 400));
  if (!name) return next(new APIError('Name is required', 400));
  if (!type) return next(new APIError('User type is required', 400));
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new APIError('Invalid email format', 400));
  }
  
  // Validate password strength
  if (password.length < 6) {
    return next(new APIError('Password must be at least 6 characters', 400));
  }
  
  // Validate user type
  if (type !== 'car_owner' && type !== 'relative') {
    return next(new APIError('User type must be either car_owner or relative', 400));
  }
  
  // Additional validation for car owners
  if (type === 'car_owner') {
    const { car_name } = req.body;
    if (!car_name) {
      return next(new APIError('Car name is required for car owners', 400));
    }
  }
  
  next();
};

/**
 * Validates user preferences data
 */
const validateUserPreferences = (req, res, next) => {
  const { dark_mode } = req.body;
  
  if (dark_mode === undefined) {
    return next(new APIError('Dark mode preference is required', 400));
  }
  
  // Make sure dark_mode is a boolean
  if (typeof dark_mode !== 'boolean') {
    return next(new APIError('Dark mode must be a boolean value', 400));
  }
  
  next();
};

/**
 * Validates user profile update data
 */
const validateProfileUpdate = (req, res, next) => {
  const { name, email } = req.body;
  
  // At least one field must be provided
  if (!name && !email) {
    return next(new APIError('At least one field (name or email) must be provided', 400));
  }
  
  // Validate email format if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new APIError('Invalid email format', 400));
    }
  }
  
  next();
};

module.exports = {
  validateRequestBody,
  validateIdParam,
  validateCarControlAction,
  validateCameraControlStatus,
  validateLocationData,
  validateHwAuthStatus,
  validateRegistration,
  validateUserPreferences,
  validateProfileUpdate
}; 