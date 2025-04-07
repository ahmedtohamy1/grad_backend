const express = require('express');
const router = express.Router();
const carControlController = require('../controllers/carControlController');
const { validateRequestBody, validateIdParam, validateCarControlAction } = require('../middleware/validation');

// GET latest car control action
router.get('/', carControlController.getLatestAction);

// POST new car control action
router.post('/', validateRequestBody, validateCarControlAction, carControlController.saveAction);

// GET all car control actions
router.get('/all', carControlController.getAllActions);

// GET car control action by ID
router.get('/:id', validateIdParam(), carControlController.getActionById);

module.exports = router; 