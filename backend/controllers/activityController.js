const pool = require('../config/database');

// Get activity log for a task
exports.getActivityByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await pool.query(
      `SELECT a.id, a.task_id, a.user_id, a.action, a.old_value, a.new_value, a.created_at, u.full_name, u.email
       FROM activity_logs a
       JOIN users u ON a.user_id = u.id
       WHERE a.task_id = $1
       ORDER BY a.created_at DESC`,
      [taskId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};

// Log activity (internal use)
exports.logActivity = async (taskId, userId, action, oldValue = null, newValue = null) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs (task_id, user_id, action, old_value, new_value)
       VALUES ($1, $2, $3, $4, $5)`,
      [taskId, userId, action, oldValue, newValue]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
