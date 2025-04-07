const db = require('../config/database');
const { handleDatabaseError } = require('../middleware/errorHandler');

const validateCameraStatus = (status) => {
  if (!status) {
    throw new Error('Status is required');
  }
  
  // Validate status is either 'on' or 'off'
  if (status !== 'on' && status !== 'off') {
    throw new Error('Status must be either "on" or "off"');
  }
  
  return true;
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
        callback(null, { id: this.lastID, status });
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
        callback(null, row);
      });
    } catch (error) {
      callback(error);
    }
  }
};

module.exports = CameraControl; 