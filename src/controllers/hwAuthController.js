const HwAuth = require('../models/hwAuth');
const { APIError } = require('../middleware/errorHandler');

// Helper function to get the description from status code
const getStatusDescription = (statusCode) => {
  switch (parseInt(statusCode)) {
    case 1: return 'Authenticated';
    case 0: return 'Not authenticated';
    default: return 'Unknown authentication status';
  }
};

const hwAuthController = {
  /**
   * Save a new hardware authentication status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  saveStatus: (req, res, next) => {
    try {
      // Request body validation is handled by middleware
      const { status } = req.body;
      
      HwAuth.create({ status }, (err, result) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        res.status(201).json({
          message: 'Hardware authentication status saved successfully',
          status: status,
          description: getStatusDescription(status),
          id: result ? result.id : null
        });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get the latest hardware authentication status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getLatestStatus: (req, res, next) => {
    try {
      HwAuth.getLatest((err, row) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        if (!row) {
          throw new APIError('No hardware authentication data found', 404);
        }
        
        res.json({ hwAuth: row });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all hardware authentication statuses
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getAllStatuses: (req, res, next) => {
    try {
      HwAuth.getAll((err, rows) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        res.json({ hwAuths: rows });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a hardware authentication status by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getStatusById: (req, res, next) => {
    try {
      const id = req.params.id;
      
      if (!id) {
        throw new APIError('Hardware authentication ID is required', 400);
      }
      
      HwAuth.getById(id, (err, row) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        if (!row) {
          throw new APIError(`Hardware authentication with ID ${id} not found`, 404);
        }
        
        res.json({ hwAuth: row });
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = hwAuthController; 