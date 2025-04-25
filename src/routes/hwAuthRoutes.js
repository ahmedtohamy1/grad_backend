const express = require('express');
const router = express.Router();
const hwAuthController = require('../controllers/hwAuthController');
const { validateRequestBody, validateIdParam, validateHwAuthStatus } = require('../middleware/validation');

// GET latest hardware authentication status
router.get('/', hwAuthController.getLatestStatus);

// POST new hardware authentication status
router.post('/', validateRequestBody, validateHwAuthStatus, hwAuthController.saveStatus);

// GET all hardware authentication statuses
router.get('/all', hwAuthController.getAllStatuses);

// GET hardware authentication by ID
router.get('/:id', validateIdParam(), hwAuthController.getStatusById);

module.exports = router; 