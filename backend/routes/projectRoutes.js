const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifyToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// GET all projects
router.get('/', verifyToken, projectController.getAllProjects);

// GET user-specific projects
router.get('/user/analytics', verifyToken, projectController.getUserProjects);

// GET project tasks (must be before /:id)
router.get('/:id/tasks', verifyToken, projectController.getProjectTasks);

// GET project by ID
router.get('/:id', verifyToken, projectController.getProjectById);

// POST create new project
router.post('/', verifyToken, checkPermission('projects', 'create'), projectController.createProject);

// PUT update project
router.put('/:id', verifyToken, checkPermission('projects', 'update'), projectController.updateProject);

// DELETE project
router.delete('/:id', verifyToken, checkPermission('projects', 'delete'), projectController.deleteProject);

module.exports = router;
