const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const db = new sqlite3.Database(path.join(__dirname, '../../database.db'), (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to the SQLite database');
    
    // Create tables if they don't exist
    createTables();
  }
});

// Create database tables
const createTables = () => {
  // Locations table
  db.run(`CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude TEXT NOT NULL,
    longitude TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating locations table', err);
    } else {
      console.log('Locations table ready');
    }
  });

  // Car Control table
  db.run(`CREATE TABLE IF NOT EXISTS car_controls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating car_controls table', err);
    } else {
      console.log('Car Controls table ready');
    }
  });

  // Camera Control table
  db.run(`CREATE TABLE IF NOT EXISTS camera_controls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating camera_controls table', err);
    } else {
      console.log('Camera Controls table ready');
    }
  });
  
  // Hardware Auth table
  db.run(`CREATE TABLE IF NOT EXISTS hw_auths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating hw_auths table', err);
    } else {
      console.log('Hardware Auth table ready');
    }
  });

  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    type TEXT NOT NULL,
    profile_img TEXT,
    car_img TEXT,
    car_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating users table', err);
    } else {
      console.log('Users table ready');
    }
  });

  // User preferences table
  db.run(`CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER PRIMARY KEY,
    dark_mode INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error creating user_preferences table', err);
    } else {
      console.log('User preferences table ready');
    }
  });

  // User relationships table (car owner to relatives)
  db.run(`CREATE TABLE IF NOT EXISTS user_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    relative_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (relative_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (owner_id, relative_id)
  )`, (err) => {
    if (err) {
      console.error('Error creating user_relationships table', err);
    } else {
      console.log('User relationships table ready');
    }
  });
};

  // DMS (Driver Monitoring System) table
  db.run(`CREATE TABLE IF NOT EXISTS dms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating dms table', err);
    } else {
      console.log('DMS table ready');
    }
  });

  // Handle application shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

module.exports = db; 