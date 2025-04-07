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
  if (isNaN(actionNum) || actionNum < 1 || actionNum > 5) {
    return next(new APIError('Action must be a number between 1 and 5', 400));
  }
  
  next();
};

/**
 * Validates camera control status value
 */
const validateCameraControlStatus = (req, res, next) => {
  const { status } = req.body;
  
  if (!status) {
    return next(new APIError('Status is required', 400));
  }
  
  if (status !== 'on' && status !== 'off') {
    return next(new APIError('Status must be either "on" or "off"', 400));
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

module.exports = {
  validateRequestBody,
  validateIdParam,
  validateCarControlAction,
  validateCameraControlStatus,
  validateLocationData
}; 