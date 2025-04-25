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
};

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