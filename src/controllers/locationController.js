const Location = require('../models/location');
const { APIError } = require('../middleware/errorHandler');

const locationController = {
  /**
   * Save a new location
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  saveLocation: (req, res, next) => {
    try {
      // Validate request body exists
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new APIError('Request body is empty', 400);
      }
      
      const { latitude, longitude, status } = req.body;
      
      if (!latitude || !longitude || !status) {
        throw new APIError('Latitude, longitude, and status are required', 400);
      }
      
      Location.create({ latitude, longitude, status }, (err, result) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        res.status(201).json({
          message: 'Location saved successfully',
          location: {
            id: result ? result.id : null,
            latitude,
            longitude,
            status
          }
        });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get the latest location
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getLatestLocation: (req, res, next) => {
    try {
      Location.getLatest((err, row) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        if (!row) {
          throw new APIError('No location data found', 404);
        }
        
        res.json({ location: row });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all locations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getAllLocations: (req, res, next) => {
    try {
      Location.getAll((err, rows) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        res.json({ locations: rows });
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get location by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getLocationById: (req, res, next) => {
    try {
      const id = req.params.id;
      
      if (!id) {
        throw new APIError('Location ID is required', 400);
      }
      
      Location.getById(id, (err, row) => {
        if (err) {
          return next(new APIError(err.message, 500));
        }
        
        if (!row) {
          throw new APIError(`Location with ID ${id} not found`, 404);
        }
        
        res.json({ location: row });
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = locationController; 