const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');
const userProfileController = require('../controllers/userProfileController');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
router.get('/profile', verifyToken, userProfileController.getOwnProfile);
router.get('/profile/:userId', verifyToken, userProfileController.getUserProfile);
router.put('/profile', verifyToken, userProfileController.updateOwnProfile);
router.put('/profile/:userId', verifyToken, userProfileController.updateUserProfile);
router.post('/profile/upload-photo', verifyToken, upload.single('profile_photo'), userProfileController.uploadProfilePhoto);
router.post('/last-login', verifyToken, userProfileController.updateLastLogin);

module.exports = router;
