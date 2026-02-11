const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to get attachment from either table
const getAttachmentById = async (attachmentId) => {
  console.log('Looking for attachment ID:', attachmentId);
  
  // Try task_attachments first
  let result = await pool.query(
    'SELECT *, \'task\' as type FROM task_attachments WHERE id = $1',
    [attachmentId]
  );

  console.log('Task attachments result:', result.rows.length);
  if (result.rows.length > 0) {
    console.log('Found in task_attachments');
    return result.rows[0];
  }

  // Try project_attachments
  result = await pool.query(
    'SELECT *, \'project\' as type FROM project_attachments WHERE id = $1',
    [attachmentId]
  );

  console.log('Project attachments result:', result.rows.length);
  if (result.rows.length > 0) {
    console.log('Found in project_attachments');
    return result.rows[0];
  }

  console.log('Attachment not found in either table');
  return null;
};

// Get attachments for a project
const getProjectAttachments = async (req, res) => {
  try {
    const { projectId } = req.params;

    console.log('Fetching project attachments for project:', projectId);

    const result = await pool.query(
      `SELECT a.id, a.project_id, a.uploaded_by, a.file_name, a.file_path, a.file_size, a.file_type, a.created_at, u.full_name as uploaded_by_name 
       FROM project_attachments a 
       JOIN users u ON a.uploaded_by = u.id 
       WHERE a.project_id = $1 
       ORDER BY a.created_at DESC`,
      [projectId]
    );

    console.log('Found attachments:', result.rows.length);
    result.rows.forEach(row => {
      console.log('Attachment ID:', row.id, 'File:', row.file_name);
    });

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project attachments:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
};

// Get attachments for a task
const getTaskAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;

    console.log('Fetching task attachments for task:', taskId);

    const result = await pool.query(
      `SELECT a.id, a.task_id, a.uploaded_by, a.file_name, a.file_path, a.file_size, a.file_type, a.created_at, u.full_name as uploaded_by_name 
       FROM task_attachments a 
       JOIN users u ON a.uploaded_by = u.id 
       WHERE a.task_id = $1 
       ORDER BY a.created_at DESC`,
      [taskId]
    );

    console.log('Found attachments:', result.rows.length);
    result.rows.forEach(row => {
      console.log('Attachment ID:', row.id, 'File:', row.file_name);
    });

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
};

// Upload attachment
const uploadAttachment = async (req, res) => {
  try {
    const { taskId, projectId } = req.params;
    const userId = req.user.id;

    console.log('Upload request - taskId:', taskId, 'projectId:', projectId);

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    fs.writeFileSync(filePath, req.file.buffer);
    console.log('File saved:', fileName);

    let result;
    if (taskId) {
      // Save task attachment
      result = await pool.query(
        `INSERT INTO task_attachments (task_id, uploaded_by, file_name, file_path, file_size, file_type) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [taskId, userId, req.file.originalname, fileName, req.file.size, req.file.mimetype]
      );
      console.log('Task attachment created with ID:', result.rows[0].id);
    } else if (projectId) {
      // Save project attachment
      result = await pool.query(
        `INSERT INTO project_attachments (project_id, uploaded_by, file_name, file_path, file_size, file_type) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [projectId, userId, req.file.originalname, fileName, req.file.size, req.file.mimetype]
      );
      console.log('Project attachment created with ID:', result.rows[0].id);
    } else {
      return res.status(400).json({ error: 'Task ID or Project ID required' });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
};

// Download attachment
const downloadAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    console.log('Download request for attachment:', attachmentId);

    const attachment = await getAttachmentById(attachmentId);

    if (!attachment) {
      console.log('Attachment not found:', attachmentId);
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const filePath = path.join(uploadsDir, attachment.file_path);

    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
      return res.status(404).json({ error: 'File not found' });
    }

    console.log('Downloading file:', filePath);
    res.download(filePath, attachment.file_name);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
};

// Delete attachment
const deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.id;

    console.log('Delete request for attachment:', attachmentId, 'by user:', userId);

    const attachment = await getAttachmentById(attachmentId);

    if (!attachment) {
      console.log('Attachment not found for ID:', attachmentId);
      return res.status(404).json({ error: 'Attachment not found' });
    }

    console.log('Found attachment:', attachment);

    // Only allow uploader or admin to delete
    if (attachment.uploaded_by !== userId && req.user.role !== 'admin') {
      console.log('Unauthorized: uploader is', attachment.uploaded_by, 'user is', userId, 'role is', req.user.role);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete file from filesystem
    const filePath = path.join(uploadsDir, attachment.file_path);
    console.log('Deleting file:', filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('File deleted');
    }

    // Delete from database based on type
    if (attachment.type === 'task') {
      console.log('Deleting from task_attachments');
      await pool.query('DELETE FROM task_attachments WHERE id = $1', [attachmentId]);
    } else if (attachment.type === 'project') {
      console.log('Deleting from project_attachments');
      await pool.query('DELETE FROM project_attachments WHERE id = $1', [attachmentId]);
    }

    console.log('Attachment deleted successfully');
    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
};

module.exports = {
  getProjectAttachments,
  getTaskAttachments,
  uploadAttachment,
  downloadAttachment,
  deleteAttachment,
  deleteProjectAttachment: async (req, res) => {
    try {
      const { attachmentId } = req.params;
      const userId = req.user.id;

      console.log('Delete project attachment:', attachmentId, 'by user:', userId);

      const result = await pool.query(
        'SELECT * FROM project_attachments WHERE id = $1',
        [attachmentId]
      );

      if (result.rows.length === 0) {
        console.log('Project attachment not found:', attachmentId);
        return res.status(404).json({ error: 'Attachment not found' });
      }

      const attachment = result.rows[0];
      console.log('Found attachment:', attachment);

      // Only allow uploader or admin to delete
      if (attachment.uploaded_by !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Delete file
      const filePath = path.join(uploadsDir, attachment.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      await pool.query('DELETE FROM project_attachments WHERE id = $1', [attachmentId]);

      console.log('Project attachment deleted successfully');
      res.json({ message: 'Attachment deleted successfully' });
    } catch (error) {
      console.error('Error deleting project attachment:', error);
      res.status(500).json({ error: 'Failed to delete attachment' });
    }
  },
  deleteTaskAttachment: async (req, res) => {
    try {
      const { attachmentId } = req.params;
      const userId = req.user.id;

      console.log('Delete task attachment:', attachmentId, 'by user:', userId);

      const result = await pool.query(
        'SELECT * FROM task_attachments WHERE id = $1',
        [attachmentId]
      );

      if (result.rows.length === 0) {
        console.log('Task attachment not found:', attachmentId);
        return res.status(404).json({ error: 'Attachment not found' });
      }

      const attachment = result.rows[0];
      console.log('Found attachment:', attachment);

      // Only allow uploader or admin to delete
      if (attachment.uploaded_by !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Delete file
      const filePath = path.join(uploadsDir, attachment.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      await pool.query('DELETE FROM task_attachments WHERE id = $1', [attachmentId]);

      console.log('Task attachment deleted successfully');
      res.json({ message: 'Attachment deleted successfully' });
    } catch (error) {
      console.error('Error deleting task attachment:', error);
      res.status(500).json({ error: 'Failed to delete attachment' });
    }
  },
};
