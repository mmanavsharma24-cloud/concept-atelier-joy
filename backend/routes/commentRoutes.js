const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Get all comments for a task
router.get('/task/:taskId', verifyToken, checkPermission('comments', 'read'), commentController.getCommentsByTask);

// Add a comment
router.post('/task/:taskId', verifyToken, checkPermission('comments', 'create'), commentController.addComment);

// Update a comment
router.put('/:commentId', verifyToken, checkPermission('comments', 'update'), commentController.updateComment);

// Delete a comment
router.delete('/:commentId', verifyToken, checkPermission('comments', 'delete'), commentController.deleteComment);

module.exports = router;
