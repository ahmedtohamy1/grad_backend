const express = require('express');
const router = express.Router();
const locationRoutes = require('./locationRoutes');
const carControlRoutes = require('./carControlRoutes');

// Welcome route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// API routes
router.use('/api/location', locationRoutes);
router.use('/api/car-control', carControlRoutes);

module.exports = router; 