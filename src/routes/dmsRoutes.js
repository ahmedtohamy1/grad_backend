const express = require('express');
const router = express.Router();
const dmsController = require('../controllers/dmsController');
const { authenticateToken } = require('../middleware/auth');

// Create DMS status - POST /api/dms
router.post('/', dmsController.createStatus);

// Get latest DMS status - GET /api/dms/latest
router.get('/latest', dmsController.getLatestStatus);

// Get DMS history - GET /api/dms/history
router.get('/history', authenticateToken, dmsController.getHistory);

module.exports = router; 