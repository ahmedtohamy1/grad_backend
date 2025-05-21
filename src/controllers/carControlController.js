const CarControl = require('../models/carControl');
const { APIError } = require('../middleware/errorHandler');

// Validate action value
const isValidAction = (action) => {
  if (!action) return false;
  
  const actionNumber = parseInt(action);
  return actionNumber >= 5 && actionNumber <= 9;
};

// Get action description
const getActionDescription = (action) => {
  switch (action) {
    case '5':
      return 'stop';
    case '6':
      return 'forward';
    case '7':
      return 'back';
    case '8':
      return 'right';
    case '9':
      return 'left';
    default:
      return 'unknown';
  }
};

const carControlController = {
  /**
   * Save a new car control action
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  saveAction: (req, res, next) => {
    try {
      // Validate request body exists
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new APIError('Request body is empty', 400);
      }
      
      const { action } = req.body;
      
      if (!action) {
        throw new APIError('Action is required', 400);
      }

      if (!isValidAction(action)) {
        throw new APIError('Invalid action value. Must be between 5-9', 400);
      }
      
      CarControl.create({ action }, (err, result) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        res.status(201).json({
          message: 'Car control action saved successfully',
          action: action,
          description: getActionDescription(action),
          id: result ? result.id : null
        });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get the latest car control action
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getLatestAction: (req, res, next) => {
    try {
      CarControl.getLatest((err, row) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        if (!row) {
          throw new APIError('No car control data found', 404);
        }
        
        // Add description to the response
        const response = {
          ...row,
          description: getActionDescription(row.action)
        };
        
        res.json({ carControl: response });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all car control actions
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getAllActions: (req, res, next) => {
    try {
      CarControl.getAll((err, rows) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        // Add descriptions to all rows
        const enhancedRows = rows.map(row => ({
          ...row,
          description: getActionDescription(row.action)
        }));
        
        res.json({ carControls: enhancedRows });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a car control action by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getActionById: (req, res, next) => {
    try {
      const id = req.params.id;
      
      if (!id) {
        throw new APIError('Car control ID is required', 400);
      }
      
      CarControl.getById(id, (err, row) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        if (!row) {
          throw new APIError(`Car control with ID ${id} not found`, 404);
        }
        
        // Add description to the response
        const response = {
          ...row,
          description: getActionDescription(row.action)
        };
        
        res.json({ carControl: response });
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = carControlController; 