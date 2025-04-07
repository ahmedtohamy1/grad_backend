const db = require('../config/database');
const { handleDatabaseError } = require('../middleware/errorHandler');

const validateLocationData = (location) => {
  const { latitude, longitude, status } = location;
  
  if (!latitude) {
    throw new Error('Latitude is required');
  }
  
  if (!longitude) {
    throw new Error('Longitude is required');
  }
  
  if (!status) {
    throw new Error('Status is required');
  }
  
  // Validate latitude/longitude format - only check if they are numbers
  const latNum = parseFloat(latitude);
  const lonNum = parseFloat(longitude);
  
  if (isNaN(latNum) || isNaN(lonNum)) {
    throw new Error('Latitude and longitude must be valid numbers');
  }
  
  // Range validation removed - allowing any numeric values
  
  return true;
};

const Location = {
  /**
   * Create a new location entry
   * @param {Object} location - Location data
   * @param {Function} callback - Callback function
   */
  create: (location, callback) => {
    try {
      validateLocationData(location);
      
      const { latitude, longitude, status } = location;
      const sql = 'INSERT INTO locations (latitude, longitude, status) VALUES (?, ?, ?)';
      
      db.run(sql, [latitude, longitude, status], function(err) {
        if (err) {
          return callback(err);
        }
        callback(null, { 
          id: this.lastID, 
          latitude, 
          longitude, 
          status 
        });
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Get the latest location entry
   * @param {Function} callback - Callback function
   */
  getLatest: (callback) => {
    try {
      const sql = 'SELECT * FROM locations ORDER BY created_at DESC LIMIT 1';
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
   * Get all location entries
   * @param {Function} callback - Callback function
   */
  getAll: (callback) => {
    try {
      const sql = 'SELECT * FROM locations ORDER BY created_at DESC';
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
   * Get location by ID
   * @param {Number} id - Location ID
   * @param {Function} callback - Callback function
   */
  getById: (id, callback) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid ID is required');
      }
      
      const sql = 'SELECT * FROM locations WHERE id = ?';
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

module.exports = Location; 