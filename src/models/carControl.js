const db = require('../config/database');
const { handleDatabaseError } = require('../middleware/errorHandler');

const validateAction = (action) => {
  if (!action) {
    throw new Error('Action is required');
  }
  
  const actionNum = parseInt(action);
  if (isNaN(actionNum) || actionNum < 5 || actionNum > 9) {
    throw new Error('Action must be a number between 5 and 9');
  }
  
  return true;
};

const CarControl = {
  /**
   * Create a new car control action
   * @param {Object} carControl - Car control data
   * @param {Function} callback - Callback function
   */
  create: (carControl, callback) => {
    try {
      const { action } = carControl;
      validateAction(action);
      
      const sql = 'INSERT INTO car_controls (action) VALUES (?)';
      db.run(sql, [action], function(err) {
        if (err) {
          return callback(err);
        }
        callback(null, { id: this.lastID, action });
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Get the latest car control action
   * @param {Function} callback - Callback function
   */
  getLatest: (callback) => {
    try {
      const sql = 'SELECT * FROM car_controls ORDER BY created_at DESC LIMIT 1';
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
   * Get all car control actions
   * @param {Function} callback - Callback function
   */
  getAll: (callback) => {
    try {
      const sql = 'SELECT * FROM car_controls ORDER BY created_at DESC';
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
   * Get car control action by ID
   * @param {Number} id - Car control action ID
   * @param {Function} callback - Callback function
   */
  getById: (id, callback) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid ID is required');
      }
      
      const sql = 'SELECT * FROM car_controls WHERE id = ?';
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

module.exports = CarControl; 