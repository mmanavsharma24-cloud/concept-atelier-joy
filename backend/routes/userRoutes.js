const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// GET all users
router.get('/', verifyToken, checkPermission('users', 'read'), userController.getAllUsers);

// GET user by ID
router.get('/:id', verifyToken, checkPermission('users', 'read'), userController.getUserById);

// POST create new user
router.post('/', verifyToken, checkPermission('users', 'create'), userController.createUser);

// PUT update user
router.put('/:id', verifyToken, checkPermission('users', 'update'), userController.updateUser);

// DELETE user
router.delete('/:id', verifyToken, checkPermission('users', 'delete'), userController.deleteUser);

module.exports = router;
