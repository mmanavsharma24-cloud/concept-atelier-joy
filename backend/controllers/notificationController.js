const pool = require('../config/database');

// Get all notifications for user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, is_read, priority } = req.query;

    let query = `
      SELECT n.*, 
             t.title as task_title,
             p.name as project_name,
             u.full_name as related_user_name
      FROM notifications n
      LEFT JOIN tasks t ON n.task_id = t.id
      LEFT JOIN projects p ON n.project_id = p.id
      LEFT JOIN users u ON n.related_user_id = u.id
      WHERE n.user_id = $1 AND n.is_archived = FALSE
    `;
    
    const params = [userId];
    let paramIndex = 2;

    if (type && type !== 'all') {
      query += ` AND n.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (is_read !== undefined) {
      query += ` AND n.is_read = $${paramIndex}`;
      params.push(is_read === 'true');
      paramIndex++;
    }

    if (priority && priority !== 'all') {
      query += ` AND n.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    query += ` ORDER BY CASE n.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 WHEN 'low' THEN 4 ELSE 5 END, n.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get archived notifications
const getArchivedNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT n.*, 
              t.title as task_title,
              p.name as project_name,
              u.full_name as related_user_name
       FROM notifications n
       LEFT JOIN tasks t ON n.task_id = t.id
       LEFT JOIN projects p ON n.project_id = p.id
       LEFT JOIN users u ON n.related_user_id = u.id
       WHERE n.user_id = $1 AND n.is_archived = TRUE
       ORDER BY n.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching archived notifications:', error);
    res.status(500).json({ error: 'Failed to fetch archived notifications' });
  }
};

// Restore notification from archive
const restoreNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE notifications SET is_archived = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error restoring notification:', error);
    res.status(500).json({ error: 'Failed to restore notification' });
  }
};
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE AND is_archived = FALSE',
      [userId]
    );
    
    res.json({ unread_count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE notifications SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Archive notification
const archiveNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE notifications SET is_archived = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error archiving notification:', error);
    res.status(500).json({ error: 'Failed to archive notification' });
  }
};

// Clear all notifications
const clearAll = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_archived = TRUE, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND is_archived = FALSE',
      [userId]
    );

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
};

// Create notification (internal use)
const createNotification = async (userId, type, title, message, taskId = null, projectId = null, relatedUserId = null, priority = 'normal') => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, task_id, project_id, related_user_id, priority) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, type, title, message, taskId, projectId, relatedUserId, priority]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  getNotifications,
  getArchivedNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  restoreNotification,
  clearAll,
  createNotification,
};
