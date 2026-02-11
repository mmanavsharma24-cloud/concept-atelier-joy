const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// GET all tasks
router.get('/', verifyToken, taskController.getAllTasks);

// GET user-specific tasks
router.get('/user/analytics', verifyToken, taskController.getUserTasks);

// GET tasks by project ID
router.get('/project/:projectId', verifyToken, taskController.getTasksByProject);

// GET task by ID
router.get('/:id', verifyToken, taskController.getTaskById);

// POST create new task
router.post('/', verifyToken, checkPermission('tasks', 'create'), taskController.createTask);

// PUT update task
router.put('/:id', verifyToken, checkPermission('tasks', 'update'), taskController.updateTask);

// DELETE task
router.delete('/:id', verifyToken, checkPermission('tasks', 'delete'), taskController.deleteTask);

module.exports = router;
