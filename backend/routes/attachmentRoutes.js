const express = require('express');
const router = express.Router();
const multer = require('multer');
const attachmentController = require('../controllers/attachmentController');
const { verifyToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/zip',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// GET project attachments
router.get('/project/:projectId', verifyToken, attachmentController.getProjectAttachments);

// GET task attachments
router.get('/task/:taskId', verifyToken, attachmentController.getTaskAttachments);

// POST upload project attachment
router.post('/project/:projectId', verifyToken, checkPermission('projects', 'update'), upload.single('file'), attachmentController.uploadAttachment);

// POST upload task attachment
router.post('/task/:taskId', verifyToken, checkPermission('tasks', 'update'), upload.single('file'), attachmentController.uploadAttachment);

// DELETE project attachment (specific) - MUST come before generic delete
router.delete('/project/:attachmentId', verifyToken, attachmentController.deleteProjectAttachment);

// DELETE task attachment (specific) - MUST come before generic delete
router.delete('/task/:attachmentId', verifyToken, attachmentController.deleteTaskAttachment);

// GET download attachment
router.get('/:attachmentId/download', verifyToken, attachmentController.downloadAttachment);

// DELETE attachment (generic - checks both tables) - MUST come last
router.delete('/:attachmentId', verifyToken, attachmentController.deleteAttachment);

module.exports = router;
