const express = require('express');
const router = express.Router();
const locationRoutes = require('./locationRoutes');
const carControlRoutes = require('./carControlRoutes');
const cameraControlRoutes = require('./cameraControlRoutes');
const hwAuthRoutes = require('./hwAuthRoutes');

// Welcome route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// API routes
router.use('/api/location', locationRoutes);
router.use('/api/car-control', carControlRoutes);
router.use('/api/camera-control', cameraControlRoutes);
router.use('/api/hw-auth', hwAuthRoutes);

module.exports = router; 