const db = require('../config/database');
const { handleDatabaseError } = require('../middleware/errorHandler');

const validateCameraStatus = (status) => {
  if (!status) {
    throw new Error('Status code is required');
  }
  
  // Convert to number if it's a string
  const statusCode = typeof status === 'string' ? parseInt(status) : status;
  
  // Validate status is one of the allowed codes
  if (isNaN(statusCode) || ![11, 12, 13, 14, 15, 16].includes(statusCode)) {
    throw new Error('Status code must be one of: 11, 12, 13, 14, 15, 16');
  }
  
  return true;
};

// Get status description based on code
const getStatusDescription = (statusCode) => {
  switch (parseInt(statusCode)) {
    case 11:
      return 'First camera on';
    case 12:
      return 'First camera off';
    case 13:
      return 'Second camera on';
    case 14:
      return 'Second camera off';
    case 15:
      return 'Both cameras on';
    case 16:
      return 'Both cameras off';
    default:
      return 'Unknown status';
  }
};

const CameraControl = {
  /**
   * Create a new camera control status
   * @param {Object} cameraControl - Camera control data
   * @param {Function} callback - Callback function
   */
  create: (cameraControl, callback) => {
    try {
      const { status } = cameraControl;
      validateCameraStatus(status);
      
      const sql = 'INSERT INTO camera_controls (status) VALUES (?)';
      db.run(sql, [status], function(err) {
        if (err) {
          return callback(err);
        }
        callback(null, { 
          id: this.lastID, 
          status, 
          description: getStatusDescription(status) 
        });
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Get the latest camera control status
   * @param {Function} callback - Callback function
   */
  getLatest: (callback) => {
    try {
      const sql = 'SELECT * FROM camera_controls ORDER BY created_at DESC LIMIT 1';
      db.get(sql, [], (err, row) => {
        if (err) {
          return callback(err);
        }
        
        if (row) {
          row.description = getStatusDescription(row.status);
        }
        
        callback(null, row);
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Get all camera control statuses
   * @param {Function} callback - Callback function
   */
  getAll: (callback) => {
    try {
      const sql = 'SELECT * FROM camera_controls ORDER BY created_at DESC';
      db.all(sql, [], (err, rows) => {
        if (err) {
          return callback(err);
        }
        
        // Add description to each row
        if (rows && rows.length > 0) {
          rows.forEach(row => {
            row.description = getStatusDescription(row.status);
          });
        }
        
        callback(null, rows);
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Get camera control by ID
   * @param {Number} id - Camera control ID
   * @param {Function} callback - Callback function
   */
  getById: (id, callback) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid ID is required');
      }
      
      const sql = 'SELECT * FROM camera_controls WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) {
          return callback(err);
        }
        
        if (row) {
          row.description = getStatusDescription(row.status);
        }
        
        callback(null, row);
      });
    } catch (error) {
      callback(error);
    }
  }
};

module.exports = CameraControl; 