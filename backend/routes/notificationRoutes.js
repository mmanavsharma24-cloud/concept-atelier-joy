const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

// GET unread count (must be before /:id routes)
router.get('/unread/count', verifyToken, notificationController.getUnreadCount);

// GET archived notifications
router.get('/archived/list', verifyToken, notificationController.getArchivedNotifications);

// PUT mark all as read (must be before /:id routes)
router.put('/read/all', verifyToken, notificationController.markAllAsRead);

// PUT clear all notifications (must be before /:id routes)
router.put('/clear/all', verifyToken, notificationController.clearAll);

// GET all notifications
router.get('/', verifyToken, notificationController.getNotifications);

// PUT mark notification as read
router.put('/:id/read', verifyToken, notificationController.markAsRead);

// PUT restore notification from archive
router.put('/:id/restore', verifyToken, notificationController.restoreNotification);

// PUT archive notification
router.put('/:id/archive', verifyToken, notificationController.archiveNotification);

module.exports = router;
