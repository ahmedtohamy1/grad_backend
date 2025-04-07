const express = require('express');
const router = express.Router();
const cameraControlController = require('../controllers/cameraControlController');
const { validateRequestBody, validateIdParam, validateCameraControlStatus } = require('../middleware/validation');

// GET latest camera control status
router.get('/', cameraControlController.getLatestStatus);

// POST new camera control status
router.post('/', validateRequestBody, validateCameraControlStatus, cameraControlController.saveStatus);

// GET all camera control statuses
router.get('/all', cameraControlController.getAllStatuses);

// GET camera control by ID
router.get('/:id', validateIdParam(), cameraControlController.getStatusById);

module.exports = router; 