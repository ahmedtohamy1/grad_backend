const CameraControl = require('../models/cameraControl');
const { APIError } = require('../middleware/errorHandler');

// Helper function to get the description from status code
const getStatusDescription = (statusCode) => {
  switch (parseInt(statusCode)) {
    case 11: return 'First camera on';
    case 12: return 'First camera off';
    case 13: return 'Second camera on';
    case 14: return 'Second camera off';
    case 15: return 'Both cameras on';
    case 16: return 'Both cameras off';
    default: return 'Unknown status';
  }
};

const cameraControlController = {
  /**
   * Save a new camera control status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  saveStatus: (req, res, next) => {
    try {
      // Request body validation is handled by middleware
      const { status } = req.body;
      
      CameraControl.create({ status }, (err, result) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        res.status(201).json({
          message: 'Camera control status saved successfully',
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
   * Get the latest camera control status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getLatestStatus: (req, res, next) => {
    try {
      CameraControl.getLatest((err, row) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        if (!row) {
          throw new APIError('No camera control data found', 404);
        }
        
        res.json({ cameraControl: row });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all camera control statuses
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getAllStatuses: (req, res, next) => {
    try {
      CameraControl.getAll((err, rows) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        res.json({ cameraControls: rows });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a camera control by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getStatusById: (req, res, next) => {
    try {
      const id = req.params.id;
      
      if (!id) {
        throw new APIError('Camera control ID is required', 400);
      }
      
      CameraControl.getById(id, (err, row) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        if (!row) {
          throw new APIError(`Camera control with ID ${id} not found`, 404);
        }
        
        res.json({ cameraControl: row });
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = cameraControlController; 