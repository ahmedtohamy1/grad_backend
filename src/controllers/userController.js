const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { APIError } = require('../middleware/errorHandler');

// Get JWT secret from environment or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_for_development';

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, type: user.type }, JWT_SECRET, { expiresIn: '7d' });
};

const userController = {
  /**
   * Register a new user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  register: (req, res, next) => {
    try {
      const userData = req.body;
      
      User.create(userData, (err, user) => {
        if (err) {
          return next(err);
        }
        
        // Generate JWT token
        const token = generateToken(user);
        
        res.status(201).json({
          message: 'User registered successfully',
          user,
          token
        });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * User login
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  login: (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      User.login({ email, password }, (err, user) => {
        if (err) {
          return next(err);
        }
        
        // Generate JWT token
        const token = generateToken(user);
        
        res.json({
          message: 'Login successful',
          user,
          token
        });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user profile
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getProfile: (req, res, next) => {
    try {
      const userId = req.user.id; // From auth middleware
      
      User.getById(userId, (err, user) => {
        if (err) {
          return next(err);
        }
        
        res.json({ user });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get car owner details with relatives
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getOwnerWithRelatives: (req, res, next) => {
    try {
      const ownerId = req.params.id || req.user.id;
      
      User.getOwnerWithRelatives(ownerId, (err, owner) => {
        if (err) {
          return next(err);
        }
        
        res.json({ owner });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get owners for a relative
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getOwnersForRelative: (req, res, next) => {
    try {
      const relativeId = req.params.id || req.user.id;
      
      User.getOwnersForRelative(relativeId, (err, owners) => {
        if (err) {
          return next(err);
        }
        
        res.json({ owners });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add relative to car owner
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  addRelative: (req, res, next) => {
    try {
      const ownerId = req.user.id; // From auth middleware
      const { relativeId } = req.body;
      
      if (!relativeId) {
        throw new APIError('Relative ID is required', 400);
      }
      
      User.addRelative(ownerId, relativeId, (err, relationship) => {
        if (err) {
          return next(err);
        }
        
        res.status(201).json({
          message: 'Relative added successfully',
          relationship
        });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove relative from car owner
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  removeRelative: (req, res, next) => {
    try {
      const ownerId = req.user.id; // From auth middleware
      const { relativeId } = req.params;
      
      if (!relativeId) {
        throw new APIError('Relative ID is required', 400);
      }
      
      User.removeRelative(ownerId, relativeId, (err, result) => {
        if (err) {
          return next(err);
        }
        
        res.json({
          message: 'Relative removed successfully',
          success: true
        });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user preferences
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getPreferences: (req, res, next) => {
    try {
      const userId = req.user.id; // From auth middleware
      
      User.getPreferences(userId, (err, preferences) => {
        if (err) {
          return next(err);
        }
        
        res.json({ preferences });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user preferences
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  updatePreferences: (req, res, next) => {
    try {
      const userId = req.user.id; // From auth middleware
      const { dark_mode } = req.body;
      
      if (dark_mode === undefined) {
        throw new APIError('No preferences specified to update', 400);
      }
      
      User.updatePreferences(userId, { dark_mode }, (err, preferences) => {
        if (err) {
          return next(err);
        }
        
        res.json({
          message: 'Preferences updated successfully',
          preferences
        });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle dark mode
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  toggleDarkMode: (req, res, next) => {
    try {
      const userId = req.user.id; // From auth middleware
      
      User.toggleDarkMode(userId, (err, preferences) => {
        if (err) {
          return next(err);
        }
        
        res.json({
          message: 'Dark mode toggled successfully',
          preferences
        });
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController; 