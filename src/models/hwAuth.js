const db = require('../config/database');
const { handleDatabaseError } = require('../middleware/errorHandler');

const validateHwAuthStatus = (status) => {
  if (status === undefined || status === null) {
    throw new Error('Authentication status is required');
  }
  
  // Convert to number if it's a string
  const statusCode = typeof status === 'string' ? parseInt(status) : status;
  
  // Validate status is either 0 or 1
  if (isNaN(statusCode) || ![0, 1].includes(statusCode)) {
    throw new Error('Authentication status must be either 0 or 1');
  }
  
  return true;
};

// Get status description based on code
const getStatusDescription = (statusCode) => {
  switch (parseInt(statusCode)) {
    case 1:
      return 'Authenticated';
    case 0:
      return 'Not authenticated';
    default:
      return 'Unknown authentication status';
  }
};

const HwAuth = {
  /**
   * Create a new hardware authentication status
   * @param {Object} hwAuth - Hardware authentication data
   * @param {Function} callback - Callback function
   */
  create: (hwAuth, callback) => {
    try {
      const { status } = hwAuth;
      validateHwAuthStatus(status);
      
      const sql = 'INSERT INTO hw_auths (status) VALUES (?)';
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
   * Get the latest hardware authentication status
   * @param {Function} callback - Callback function
   */
  getLatest: (callback) => {
    try {
      const sql = 'SELECT * FROM hw_auths ORDER BY created_at DESC LIMIT 1';
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
   * Get all hardware authentication statuses
   * @param {Function} callback - Callback function
   */
  getAll: (callback) => {
    try {
      const sql = 'SELECT * FROM hw_auths ORDER BY created_at DESC';
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
   * Get hardware authentication status by ID
   * @param {Number} id - Hardware authentication ID
   * @param {Function} callback - Callback function
   */
  getById: (id, callback) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid ID is required');
      }
      
      const sql = 'SELECT * FROM hw_auths WHERE id = ?';
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

module.exports = HwAuth; 