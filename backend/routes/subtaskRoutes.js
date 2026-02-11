const express = require('express');
const router = express.Router({ mergeParams: true });
const subtaskController = require('../controllers/subtaskController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Get subtask progress - must come before other routes to avoid conflicts
router.get('/:parentTaskId/subtasks/progress', subtaskController.getSubtaskProgress);

// Get all subtasks for a parent task
router.get('/:parentTaskId/subtasks', subtaskController.getSubtasks);

// Create a new subtask
router.post('/:parentTaskId/subtasks', subtaskController.createSubtask);

// Update a subtask
router.put('/:parentTaskId/subtasks/:subtaskId', subtaskController.updateSubtask);

// Delete a subtask
router.delete('/:parentTaskId/subtasks/:subtaskId', subtaskController.deleteSubtask);

module.exports = router;
