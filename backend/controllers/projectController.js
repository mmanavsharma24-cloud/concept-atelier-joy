const pool = require('../config/database');

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.id, p.name, p.description, p.owner_id, u.full_name as owner_name, p.status, p.start_date, p.end_date FROM projects p JOIN users u ON p.owner_id = u.id ORDER BY p.id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get user-specific projects (owned by or member of)
const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT DISTINCT p.id, p.name, p.description, p.owner_id, u.full_name as owner_name, p.status, p.start_date, p.end_date 
       FROM projects p 
       JOIN users u ON p.owner_id = u.id 
       LEFT JOIN project_members pm ON p.id = pm.project_id 
       WHERE p.owner_id = $1 OR pm.user_id = $1 
       ORDER BY p.id`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Failed to fetch user projects' });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT p.id, p.name, p.description, p.owner_id, u.full_name as owner_name, p.status, p.start_date, p.end_date FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    const { name, description, owner_id, status, start_date, end_date } = req.body;
    
    const result = await pool.query(
      'INSERT INTO projects (name, description, owner_id, status, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, description, owner_id, status, start_date, end_date',
      [name, description, owner_id, status || 'active', start_date, end_date]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, start_date, end_date } = req.body;
    
    const result = await pool.query(
      'UPDATE projects SET name = $1, description = $2, status = $3, start_date = $4, end_date = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, name, description, status, start_date, end_date',
      [name, description, status, start_date, end_date, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Get project tasks
const getProjectTasks = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.status, t.priority, t.assigned_to, u.full_name as assigned_to_name, t.due_date, t.created_at
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ error: 'Failed to fetch project tasks' });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

module.exports = {
  getAllProjects,
  getUserProjects,
  getProjectById,
  getProjectTasks,
  createProject,
  updateProject,
  deleteProject
};
