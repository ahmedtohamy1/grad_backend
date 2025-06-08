const db = require('../config/database');

/**
 * DMS (Driver Monitoring System) model
 */
const DMS = {
  /**
   * Create a new DMS status entry
   * @param {Object} data - DMS data
   * @param {Function} callback - Callback function
   */
  create: (data, callback) => {
    const { status } = data;
    
    // Validate status
    if (status !== 0 && status !== 1) {
      return callback(new Error('Status must be 0 (no issue) or 1 (issue)'));
    }
    
    const query = `INSERT INTO dms (status) VALUES (?)`;
    
    db.run(query, [status], function(err) {
      if (err) {
        return callback(err);
      }
      
      // Return the newly created DMS entry
      DMS.getById(this.lastID, callback);
    });
  },
  
  /**
   * Get DMS status by ID
   * @param {Number} id - DMS entry ID
   * @param {Function} callback - Callback function
   */
  getById: (id, callback) => {
    const query = `SELECT * FROM dms WHERE id = ?`;
    
    db.get(query, [id], (err, dms) => {
      if (err) {
        return callback(err);
      }
      
      callback(null, dms);
    });
  },
  
  /**
   * Get latest DMS status
   * @param {Function} callback - Callback function
   */
  getLatest: (callback) => {
    const query = `SELECT * FROM dms ORDER BY created_at DESC LIMIT 1`;
    
    db.get(query, [], (err, dms) => {
      if (err) {
        return callback(err);
      }
      
      callback(null, dms);
    });
  },
  
  /**
   * Get DMS history with pagination
   * @param {Object} options - Query options
   * @param {Function} callback - Callback function
   */
  getHistory: (options = {}, callback) => {
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    
    const query = `SELECT * FROM dms ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    
    db.all(query, [limit, offset], (err, dmsEntries) => {
      if (err) {
        return callback(err);
      }
      
      callback(null, dmsEntries);
    });
  }
};

module.exports = DMS; 