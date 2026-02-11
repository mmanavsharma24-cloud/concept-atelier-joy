import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { projectService, taskService, userService } from '../services/api';
import { handleAPIError, showError } from '../utils/errorHandler';
import '../styles/Home.css';

const Home = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // For admin and manager: fetch all data
      // For regular users: fetch only their assigned tasks and projects
      let projectsData, tasksData;
      
      if (user?.role === 'user') {
        projectsData = await projectService.getUserAnalytics();
        tasksData = await taskService.getUserAnalytics();
      } else {
        projectsData = await projectService.getAll();
        tasksData = await taskService.getAll();
      }
      
      setProjects(projectsData);
      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load dashboard');
      showError(message);
      setLoading(false);
    }
  };

  const getRecentTasks = () => tasks.slice(0, 5);
  const getActiveTasks = () => tasks.filter(t => t.status === 'in_progress');
  const getCompletedTasks = () => tasks.filter(t => t.status === 'completed');

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="header-content">
          <h1>Welcome back, {user?.full_name}! 👋</h1>
          <p>Here's what's happening with your work today</p>
        </div>
      </div>

      <div className="home-stats">
        <div className="stat-card projects-card" onClick={() => setFilterType('projects')}>
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <div className="stat-number">{projects.length}</div>
            <div className="stat-label">Projects</div>
          </div>
        </div>
        <div className="stat-card tasks-card" onClick={() => setFilterType('all-tasks')}>
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-number">{tasks.length}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="stat-card progress-card" onClick={() => setFilterType('in-progress')}>
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-number">{getActiveTasks().length}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card completed-card" onClick={() => setFilterType('completed')}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{getCompletedTasks().length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {filterType ? (
        <div className="home-content">
          <div className="content-section full-width">
            <div className="section-header-with-back">
              <button className="back-btn" onClick={() => setFilterType(null)}>
                ← Back
              </button>
              <h2>
                {filterType === 'projects' ? '📁 My Projects' : 
                 filterType === 'all-tasks' ? '✓ All Tasks' :
                 filterType === 'in-progress' ? '⚡ In Progress Tasks' :
                 '✅ Completed Tasks'}
              </h2>
            </div>

            {filterType === 'projects' && (
              <div className="projects-list">
                {projects.length > 0 ? (
                  projects.map(project => (
                    <div key={project.id} className="project-item">
                      <div className="project-header">
                        <h3>{project.name}</h3>
                        <span className={`status-badge status-${project.status}`}>{project.status}</span>
                      </div>
                      <p className="project-description">{project.description || 'No description'}</p>
                      <div className="project-footer">
                        <small className="project-owner">👤 {project.owner_name}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No projects found</p>
                )}
              </div>
            )}

            {filterType === 'all-tasks' && (
              <div className="tasks-table">
                <table>
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length > 0 ? (
                      tasks.map(task => (
                        <tr key={task.id}>
                          <td>{task.title}</td>
                          <td><span className={`status-badge status-${task.status}`}>{task.status}</span></td>
                          <td><span className={`priority-badge priority-${task.priority}`}>{task.priority}</span></td>
                          <td>{task.assigned_to_name || 'Unassigned'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="no-data">No tasks found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {filterType === 'in-progress' && (
              <div className="tasks-table">
                <table>
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getActiveTasks().length > 0 ? (
                      getActiveTasks().map(task => (
                        <tr key={task.id}>
                          <td>{task.title}</td>
                          <td><span className={`status-badge status-${task.status}`}>{task.status}</span></td>
                          <td><span className={`priority-badge priority-${task.priority}`}>{task.priority}</span></td>
                          <td>{task.assigned_to_name || 'Unassigned'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="no-data">No in-progress tasks found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {filterType === 'completed' && (
              <div className="tasks-table">
                <table>
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCompletedTasks().length > 0 ? (
                      getCompletedTasks().map(task => (
                        <tr key={task.id}>
                          <td>{task.title}</td>
                          <td><span className={`status-badge status-${task.status}`}>{task.status}</span></td>
                          <td><span className={`priority-badge priority-${task.priority}`}>{task.priority}</span></td>
                          <td>{task.assigned_to_name || 'Unassigned'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="no-data">No completed tasks found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="home-content">
          <div className="content-section">
            <div className="section-header">
              <h2>📋 Recent Projects</h2>
              {projects.length === 0 && <p className="empty-text">No projects yet</p>}
            </div>
            <div className="projects-list">
              {projects.slice(0, 5).map(project => (
                <div key={project.id} className="project-item">
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    <span className={`status-badge status-${project.status}`}>{project.status}</span>
                  </div>
                  <p className="project-description">{project.description || 'No description'}</p>
                  <div className="project-footer">
                    <small className="project-owner">👤 {project.owner_name}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <div className="section-header">
              <h2>📝 Recent Tasks</h2>
              {tasks.length === 0 && <p className="empty-text">No tasks yet</p>}
            </div>
            <div className="tasks-list">
              {getRecentTasks().map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-left">
                    <div className={`task-status status-${task.status}`}></div>
                    <div className="task-info">
                      <h4>{task.title}</h4>
                      <small className="task-assigned">👤 {task.assigned_to_name || 'Unassigned'}</small>
                    </div>
                  </div>
                  <div className="task-right">
                    <span className={`priority-badge priority-${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
