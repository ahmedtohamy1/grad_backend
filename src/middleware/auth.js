const jwt = require('jsonwebtoken');
const { APIError } = require('./errorHandler');
const User = require('../models/user');

// Get JWT secret from environment or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_for_development';

/**
 * Authentication middleware to protect routes
 */
const authenticateToken = (req, res, next) => {
  // Get authorization header
  const authHeader = req.headers.authorization;
  
  // Check if token exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new APIError('No token provided', 401));
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type
    };
    
    next();
  } catch (error) {
    let message = 'Invalid token';
    let statusCode = 401;
    
    // Check token expiration
    if (error.name === 'TokenExpiredError') {
      message = 'Token expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    }
    
    next(new APIError(message, statusCode));
  }
};

/**
 * Car owner role authorization middleware
 */
const isCarOwner = (req, res, next) => {
  // Check if user is car owner
  if (req.user.type !== 'car_owner') {
    return next(new APIError('Access denied. Car owner role required.', 403));
  }
  
  next();
};

/**
 * Get user from database and attach to request
 */
const attachUser = (req, res, next) => {
  // Skip if no user in request (unauthenticated route)
  if (!req.user) {
    return next();
  }
  
  User.getById(req.user.id, (err, user) => {
    if (err) {
      return next(new APIError('Error fetching user', 500));
    }
    
    if (!user) {
      return next(new APIError('User not found', 404));
    }
    
    // Replace token user info with full user data
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
  isCarOwner,
  attachUser
}; 