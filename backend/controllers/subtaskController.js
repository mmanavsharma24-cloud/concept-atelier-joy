const pool = require('../config/database');

// Get all subtasks for a parent task
const getSubtasks = async (req, res) => {
  try {
    const { parentTaskId } = req.params;
    
    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, t.assigned_to, 
              u.full_name as assigned_to_name, t.parent_task_id, t.created_at, t.updated_at
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.parent_task_id = $1
       ORDER BY t.created_at ASC`,
      [parentTaskId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    res.status(500).json({ error: 'Failed to fetch subtasks' });
  }
};

// Create a new subtask
const createSubtask = async (req, res) => {
  try {
    const { parentTaskId } = req.params;
    const { title, description, priority, due_date, assigned_to } = req.body;
    
    // Verify parent task exists
    const parentCheck = await pool.query('SELECT id, project_id FROM tasks WHERE id = $1', [parentTaskId]);
    if (parentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Parent task not found' });
    }
    
    const projectId = parentCheck.rows[0].project_id;
    
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, assigned_to, parent_task_id, project_id)
       VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7)
       RETURNING id, title, description, status, priority, due_date, assigned_to, parent_task_id`,
      [title, description, priority || 'medium', due_date || null, assigned_to || null, parentTaskId, projectId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(500).json({ error: 'Failed to create subtask' });
  }
};

// Update a subtask
const updateSubtask = async (req, res) => {
  try {
    const { parentTaskId, subtaskId } = req.params;
    const { title, description, status, priority, due_date, assigned_to } = req.body;
    
    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           due_date = COALESCE($5, due_date),
           assigned_to = COALESCE($6, assigned_to),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND parent_task_id = $8
       RETURNING id, title, description, status, priority, due_date, assigned_to, parent_task_id`,
      [title, description, status, priority, due_date, assigned_to, subtaskId, parentTaskId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subtask not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ error: 'Failed to update subtask' });
  }
};

// Delete a subtask
const deleteSubtask = async (req, res) => {
  try {
    const { parentTaskId, subtaskId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND parent_task_id = $2 RETURNING id',
      [subtaskId, parentTaskId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subtask not found' });
    }
    
    res.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
};

// Get subtask progress for a parent task
const getSubtaskProgress = async (req, res) => {
  try {
    const { parentTaskId } = req.params;
    
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM tasks
       WHERE parent_task_id = $1`,
      [parentTaskId]
    );
    
    const { total, completed } = result.rows[0];
    res.json({
      total: parseInt(total),
      completed: parseInt(completed) || 0,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching subtask progress:', error);
    res.status(500).json({ error: 'Failed to fetch subtask progress' });
  }
};

module.exports = {
  getSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  getSubtaskProgress
};
