const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// POST signup
router.post('/signup', authController.signup);

// POST login
router.post('/login', authController.login);

// GET current user (protected route)
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;
