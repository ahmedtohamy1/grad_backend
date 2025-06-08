const DMS = require('../models/dms');
const { APIError } = require('../middleware/errorHandler');

const dmsController = {
  /**
   * Create a new DMS status entry
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  createStatus: (req, res, next) => {
    try {
      const { status } = req.body;
      
      if (status === undefined) {
        throw new APIError('Status is required', 400);
      }
      
      // Convert to number if needed
      const statusValue = parseInt(status, 10);
      
      if (isNaN(statusValue) || (statusValue !== 0 && statusValue !== 1)) {
        throw new APIError('Status must be 0 (no issue) or 1 (issue)', 400);
      }
      
      DMS.create({ status: statusValue }, (err, dms) => {
        if (err) {
          return next(err);
        }
        
        res.status(201).json({
          message: 'DMS status created successfully',
          dms
        });
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get latest DMS status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getLatestStatus: (req, res, next) => {
    try {
      DMS.getLatest((err, dms) => {
        if (err) {
          return next(err);
        }
        
        if (!dms) {
          return res.json({
            message: 'No DMS status found',
            dms: null
          });
        }
        
        res.json({
          dms
        });
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get DMS history
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  getHistory: (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 20;
      const offset = parseInt(req.query.offset, 10) || 0;
      
      DMS.getHistory({ limit, offset }, (err, dmsEntries) => {
        if (err) {
          return next(err);
        }
        
        res.json({
          count: dmsEntries.length,
          dmsEntries
        });
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dmsController; 