const pool = require('../config/database');
const { validateTask } = require('../middleware/validation');

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.project_id, t.assigned_to, u.full_name as assigned_to_name, t.status, t.priority, t.due_date,
              COALESCE((SELECT COUNT(*) FROM tasks WHERE parent_task_id = t.id), 0) as subtask_total,
              COALESCE((SELECT COUNT(*) FROM tasks WHERE parent_task_id = t.id AND status = 'completed'), 0) as subtask_completed
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.parent_task_id IS NULL
       ORDER BY t.id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get user-specific tasks (assigned to or created by user)
const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT t.id, t.title, t.description, t.project_id, t.assigned_to, u.full_name as assigned_to_name, t.status, t.priority, t.due_date FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.assigned_to = $1 ORDER BY t.id',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ error: 'Failed to fetch user tasks' });
  }
};

// Get tasks by project ID
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Validate projectId
    if (!projectId || isNaN(projectId)) {
      return res.status(400).json({ error: 'Project ID must be a valid number' });
    }

    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.project_id, t.assigned_to, u.full_name as assigned_to_name, t.status, t.priority, t.due_date,
              COALESCE((SELECT COUNT(*) FROM tasks WHERE parent_task_id = t.id), 0) as subtask_total,
              COALESCE((SELECT COUNT(*) FROM tasks WHERE parent_task_id = t.id AND status = 'completed'), 0) as subtask_completed
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.project_id = $1 AND t.parent_task_id IS NULL
       ORDER BY t.id`,
      [projectId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate id
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Task ID must be a valid number' });
    }

    const result = await pool.query(
      'SELECT t.id, t.title, t.description, t.project_id, t.assigned_to, u.full_name as assigned_to_name, t.status, t.priority, t.due_date FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = result.rows[0];
    
    // Get subtask count
    const subtaskResult = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM tasks
       WHERE parent_task_id = $1`,
      [id]
    );
    
    const { total, completed } = subtaskResult.rows[0];
    task.subtask_count = {
      total: parseInt(total),
      completed: parseInt(completed) || 0,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, project_id, assigned_to, status, priority, due_date } = req.body;
    
    // Validate input
    const validation = validateTask({
      title,
      description,
      project_id,
      assigned_to,
      status: status || 'pending',
      priority: priority || 'medium',
      due_date,
    });

    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join('; ') });
    }
    
    const result = await pool.query(
      'INSERT INTO tasks (title, description, project_id, assigned_to, status, priority, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, title, description, project_id, assigned_to, status, priority, due_date',
      [title, description, project_id, assigned_to || null, status || 'pending', priority || 'medium', due_date || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, status, priority, due_date } = req.body;
    
    // Validate id
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Task ID must be a valid number' });
    }

    // Validate input
    const validation = validateTask({
      title: title || '',
      description,
      project_id: 1, // Dummy value for validation
      assigned_to,
      status,
      priority,
      due_date,
    });

    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join('; ') });
    }
    
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, assigned_to = $3, status = $4, priority = $5, due_date = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING id, title, description, assigned_to, status, priority, due_date',
      [title, description, assigned_to || null, status, priority, due_date || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate id
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Task ID must be a valid number' });
    }
    
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

module.exports = {
  getAllTasks,
  getUserTasks,
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
