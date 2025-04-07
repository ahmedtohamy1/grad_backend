const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { validateRequestBody, validateIdParam, validateLocationData } = require('../middleware/validation');

// GET latest location
router.get('/', locationController.getLatestLocation);

// POST new location
router.post('/', validateRequestBody, validateLocationData, locationController.saveLocation);

// GET all locations
router.get('/all', locationController.getAllLocations);

// GET location by ID
router.get('/:id', validateIdParam(), locationController.getLocationById);

module.exports = router; 