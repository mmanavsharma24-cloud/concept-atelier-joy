const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { verifyToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Get activity log for a task
router.get('/task/:taskId', verifyToken, checkPermission('comments', 'read'), activityController.getActivityByTask);

module.exports = router;
