const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isCarOwner } = require('../middleware/auth');
const { validateRequestBody, validateRegistration, validateUserPreferences } = require('../middleware/validation');

// Public routes
router.post('/register', validateRequestBody, validateRegistration, userController.register);
router.post('/login', validateRequestBody, userController.login);

// Protected routes - require authentication
router.get('/profile', authenticateToken, userController.getProfile);

// Car owner specific routes
router.get('/owner/relatives', authenticateToken, isCarOwner, userController.getOwnerWithRelatives);
router.post('/owner/relatives', authenticateToken, isCarOwner, validateRequestBody, userController.addRelative);
router.delete('/owner/relatives/:relativeId', authenticateToken, isCarOwner, userController.removeRelative);

// Relative specific routes
router.get('/relative/owners', authenticateToken, userController.getOwnersForRelative);

// User preferences routes
router.get('/preferences', authenticateToken, userController.getPreferences);
router.put('/preferences', authenticateToken, validateRequestBody, validateUserPreferences, userController.updatePreferences);
router.post('/preferences/toggle-dark-mode', authenticateToken, userController.toggleDarkMode);

module.exports = router; 