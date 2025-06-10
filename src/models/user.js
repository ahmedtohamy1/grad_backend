const db = require('../config/database');
const bcrypt = require('bcrypt');
const { APIError, handleDatabaseError } = require('../middleware/errorHandler');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const User = {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {Function} callback - Callback function
   */
  create: async (userData, callback) => {
    try {
      const { email, name, password, type, profile_img, car_img, car_name } = userData;
      
      // Validation
      if (!email || !name || !password || !type) {
        return callback(new APIError('Email, name, password, and user type are required', 400));
      }
      
      if (!validateEmail(email)) {
        return callback(new APIError('Invalid email format', 400));
      }
      
      if (type !== 'car_owner' && type !== 'relative') {
        return callback(new APIError('User type must be either car_owner or relative', 400));
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Begin transaction
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Insert user
        const userSql = `INSERT INTO users 
          (email, name, password, type, profile_img, car_img, car_name) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(userSql, 
          [email, name, hashedPassword, type, profile_img || null, car_img || null, car_name || null], 
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              // Check for duplicate email
              if (err.message.includes('UNIQUE constraint failed')) {
                return callback(new APIError('Email already exists', 409));
              }
              return callback(err);
            }
            
            const userId = this.lastID;
            
            // Create user preferences
            const prefSql = `INSERT INTO user_preferences (user_id, dark_mode) VALUES (?, 0)`;
            
            db.run(prefSql, [userId], function(err) {
              if (err) {
                db.run('ROLLBACK');
                return callback(err);
              }
              
              db.run('COMMIT');
              callback(null, {
                id: userId,
                email,
                name,
                type,
                profile_img: profile_img || null,
                car_img: car_img || null,
                car_name: car_name || null
              });
            });
          }
        );
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {Function} callback - Callback function
   */
  login: async (credentials, callback) => {
    try {
      const { email, password } = credentials;
      
      if (!email || !password) {
        return callback(new APIError('Email and password are required', 400));
      }
      
      const sql = `SELECT u.*, up.dark_mode 
                  FROM users u
                  LEFT JOIN user_preferences up ON u.id = up.user_id
                  WHERE u.email = ?`;
      
      db.get(sql, [email], async (err, user) => {
        if (err) {
          return callback(err);
        }
        
        if (!user) {
          return callback(new APIError('Invalid credentials', 401));
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return callback(new APIError('Invalid credentials', 401));
        }
        
        // Don't send password back
        delete user.password;
        
        callback(null, user);
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Get user by ID
   * @param {Number} id - User ID
   * @param {Function} callback - Callback function
   */
  getById: (id, callback) => {
    try {
      const sql = `SELECT u.id, u.email, u.name, u.type, u.profile_img, 
                  u.car_img, u.car_name, u.created_at, up.dark_mode
                  FROM users u
                  LEFT JOIN user_preferences up ON u.id = up.user_id
                  WHERE u.id = ?`;
      
      db.get(sql, [id], (err, user) => {
        if (err) {
          return callback(err);
        }
        
        if (!user) {
          return callback(new APIError(`User with ID ${id} not found`, 404));
        }
        
        callback(null, user);
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Update user profile (name and email)
   * @param {Number} userId - User ID
   * @param {Object} profileData - User profile data to update
   * @param {Function} callback - Callback function
   */
  updateProfile: (userId, profileData, callback) => {
    try {
      const { name, email, car_name } = profileData;
      
      // Validate inputs
      if (!name && !email && !car_name) {
        return callback(new APIError('No data provided for update', 400));
      }
      
      if (email && !validateEmail(email)) {
        return callback(new APIError('Invalid email format', 400));
      }
      
      // Get current user data
      User.getById(userId, (err, currentUser) => {
        if (err) {
          return callback(err);
        }
        
        // Prepare update data
        const updatedName = name || currentUser.name;
        const updatedEmail = email || currentUser.email;
        const updatedCarName = car_name !== undefined ? car_name : currentUser.car_name;
        
        // Update user
        const sql = `UPDATE users SET name = ?, email = ?, car_name = ? WHERE id = ?`;
        
        db.run(sql, [updatedName, updatedEmail, updatedCarName, userId], function(err) {
          if (err) {
            // Check for duplicate email
            if (err.message.includes('UNIQUE constraint failed')) {
              return callback(new APIError('Email already exists', 409));
            }
            return callback(err);
          }
          
          if (this.changes === 0) {
            return callback(new APIError(`User with ID ${userId} not found`, 404));
          }
          
          callback(null, {
            id: userId,
            name: updatedName,
            email: updatedEmail,
            car_name: updatedCarName,
            updated: true
          });
        });
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Get car owner details with relatives
   * @param {Number} ownerId - Car owner ID
   * @param {Function} callback - Callback function
   */
  getOwnerWithRelatives: (ownerId, callback) => {
    try {
      // First get the owner
      User.getById(ownerId, (err, owner) => {
        if (err) {
          return callback(err);
        }
        
        if (owner.type !== 'car_owner') {
          return callback(new APIError('User is not a car owner', 400));
        }
        
        // Get all relatives linked to this owner
        const relativesSql = `
          SELECT u.id, u.email, u.name
          FROM users u
          JOIN user_relationships ur ON u.id = ur.relative_id
          WHERE ur.owner_id = ?`;
        
        db.all(relativesSql, [ownerId], (err, relatives) => {
          if (err) {
            return callback(err);
          }
          
          owner.relatives = relatives || [];
          callback(null, owner);
        });
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Get car owners for a relative
   * @param {Number} relativeId - Relative user ID
   * @param {Function} callback - Callback function
   */
  getOwnersForRelative: (relativeId, callback) => {
    try {
      const sql = `
        SELECT u.id, u.email, u.name, u.profile_img, u.car_img, u.car_name
        FROM users u
        JOIN user_relationships ur ON u.id = ur.owner_id
        WHERE ur.relative_id = ?`;
      
      db.all(sql, [relativeId], (err, owners) => {
        if (err) {
          return callback(err);
        }
        
        callback(null, owners || []);
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Add relative to car owner
   * @param {Number} ownerId - Car owner ID
   * @param {Number} relativeId - Relative user ID
   * @param {Function} callback - Callback function
   */
  addRelative: (ownerId, relativeId, callback) => {
    try {
      // Verify owner type
      User.getById(ownerId, (err, owner) => {
        if (err) {
          return callback(err);
        }
        
        if (owner.type !== 'car_owner') {
          return callback(new APIError('User must be a car owner to add relatives', 400));
        }
        
        // Verify relative type
        User.getById(relativeId, (err, relative) => {
          if (err) {
            return callback(err);
          }
          
          if (relative.type !== 'relative') {
            return callback(new APIError('Cannot add a car owner as a relative', 400));
          }
          
          // Add relationship
          const sql = `INSERT INTO user_relationships (owner_id, relative_id) VALUES (?, ?)`;
          db.run(sql, [ownerId, relativeId], function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                return callback(new APIError('Relationship already exists', 409));
              }
              return callback(err);
            }
            
            callback(null, {
              id: this.lastID,
              owner_id: ownerId,
              relative_id: relativeId
            });
          });
        });
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Remove relative from car owner
   * @param {Number} ownerId - Car owner ID
   * @param {Number} relativeId - Relative user ID
   * @param {Function} callback - Callback function
   */
  removeRelative: (ownerId, relativeId, callback) => {
    try {
      const sql = `DELETE FROM user_relationships WHERE owner_id = ? AND relative_id = ?`;
      
      db.run(sql, [ownerId, relativeId], function(err) {
        if (err) {
          return callback(err);
        }
        
        if (this.changes === 0) {
          return callback(new APIError('Relationship does not exist', 404));
        }
        
        callback(null, { success: true });
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Update user preferences
   * @param {Number} userId - User ID
   * @param {Object} preferences - Preferences to update
   * @param {Function} callback - Callback function
   */
  updatePreferences: (userId, preferences, callback) => {
    try {
      const darkMode = preferences.dark_mode !== undefined ? preferences.dark_mode ? 1 : 0 : null;
      
      if (darkMode === null) {
        return callback(new APIError('No preferences specified to update', 400));
      }
      
      const sql = `UPDATE user_preferences SET dark_mode = ? WHERE user_id = ?`;
      
      db.run(sql, [darkMode, userId], function(err) {
        if (err) {
          return callback(err);
        }
        
        if (this.changes === 0) {
          // Preferences don't exist yet, insert them
          const insertSql = `INSERT INTO user_preferences (user_id, dark_mode) VALUES (?, ?)`;
          db.run(insertSql, [userId, darkMode], function(err) {
            if (err) {
              return callback(err);
            }
            
            callback(null, { user_id: userId, dark_mode: darkMode === 1 });
          });
        } else {
          callback(null, { user_id: userId, dark_mode: darkMode === 1 });
        }
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Get user preferences
   * @param {Number} userId - User ID
   * @param {Function} callback - Callback function
   */
  getPreferences: (userId, callback) => {
    try {
      const sql = `SELECT dark_mode FROM user_preferences WHERE user_id = ?`;
      
      db.get(sql, [userId], (err, row) => {
        if (err) {
          return callback(err);
        }
        
        if (!row) {
          // Create default preferences if they don't exist
          const insertSql = `INSERT INTO user_preferences (user_id, dark_mode) VALUES (?, 0)`;
          db.run(insertSql, [userId], function(err) {
            if (err) {
              return callback(err);
            }
            
            callback(null, { user_id: userId, dark_mode: false });
          });
        } else {
          callback(null, { user_id: userId, dark_mode: row.dark_mode === 1 });
        }
      });
    } catch (error) {
      callback(error);
    }
  },

  /**
   * Toggle dark mode
   * @param {Number} userId - User ID
   * @param {Function} callback - Callback function
   */
  toggleDarkMode: (userId, callback) => {
    try {
      // Get current preference
      User.getPreferences(userId, (err, preferences) => {
        if (err) {
          return callback(err);
        }
        
        // Toggle it
        const newDarkMode = preferences.dark_mode ? 0 : 1;
        
        const sql = `UPDATE user_preferences SET dark_mode = ? WHERE user_id = ?`;
        
        db.run(sql, [newDarkMode, userId], function(err) {
          if (err) {
            return callback(err);
          }
          
          callback(null, { user_id: userId, dark_mode: newDarkMode === 1 });
        });
      });
    } catch (error) {
      callback(error);
    }
  }
};

module.exports = User; 