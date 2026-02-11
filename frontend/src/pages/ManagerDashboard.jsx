import { useState, useEffect } from 'react';
import { projectService, taskService, userService } from '../services/api';
import { handleAPIError, showError } from '../utils/errorHandler';
import '../styles/ManagerDashboard.css';

const ManagerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filterType, setFilterType] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData, usersData] = await Promise.all([
        projectService.getAll(),
        taskService.getAll(),
        userService.getAll(),
      ]);

      setProjects(projectsData);
      setTasks(tasksData);
      setUsers(usersData);

      // Calculate stats
      const completedTasks = tasksData.filter(t => t.status === 'completed').length;
      const inProgressTasks = tasksData.filter(t => t.status === 'in_progress').length;
      const pendingTasks = tasksData.filter(t => t.status === 'pending').length;

      setStats({
        totalProjects: projectsData.length,
        activeProjects: projectsData.filter(p => p.status === 'active').length,
        totalTasks: tasksData.length,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        completionRate: tasksData.length > 0 
          ? Math.round((completedTasks / tasksData.length) * 100)
          : 0,
        teamSize: usersData.filter(u => u.role === 'user').length,
      });

      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load manager data');
      showError(message);
      setLoading(false);
    }
  };

  const handleStatCardClick = (type) => {
    setFilterType(type);
  };

  if (loading) return <div className="loading">Loading manager dashboard...</div>;

  return (
    <div className="manager-dashboard">
      <div className="page-header">
        <h1>📊 Manager Dashboard</h1>
        <p>Team and project management overview</p>
      </div>

      {/* Manager Stats */}
      <div className="manager-stats">
        <div className="stat-card" onClick={() => handleStatCardClick('projects')}>
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalProjects}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => handleStatCardClick('active-projects')}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeProjects}</div>
            <div className="stat-label">Active Projects</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => handleStatCardClick('tasks')}>
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => handleStatCardClick('in-progress')}>
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-number">{stats.inProgressTasks}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✔️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => handleStatCardClick('team')}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.teamSize}</div>
            <div className="stat-label">Team Members</div>
          </div>
        </div>
      </div>

      {/* Task Distribution - Only show if filterType is set */}
      {filterType && (
        <div className="manager-section">
          <div className="section-header-with-back">
            <button className="back-btn" onClick={() => setFilterType(null)}>
              ← Back
            </button>
            <h2>📊 {filterType === 'projects' ? 'All Projects' : filterType === 'active-projects' ? 'Active Projects' : filterType === 'tasks' ? 'All Tasks' : filterType === 'in-progress' ? 'In Progress Tasks' : 'Team Members'}</h2>
          </div>
          
          {filterType === 'projects' && (
            <div className="projects-list">
              {projects.length > 0 ? (
                projects.map(project => {
                  const projectTasks = tasks.filter(t => t.project_id === project.id);
                  const completedProjectTasks = projectTasks.filter(t => t.status === 'completed').length;
                  const progress = projectTasks.length > 0 
                    ? Math.round((completedProjectTasks / projectTasks.length) * 100)
                    : 0;

                  return (
                    <div key={project.id} className="project-card">
                      <div className="project-header">
                        <h3>{project.name}</h3>
                        <span className={`status-badge status-${project.status}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="project-description">{project.description || 'No description'}</p>
                      <div className="project-stats">
                        <div className="project-stat">
                          <span className="stat-label">Tasks:</span>
                          <span className="stat-value">{projectTasks.length}</span>
                        </div>
                        <div className="project-stat">
                          <span className="stat-label">Completed:</span>
                          <span className="stat-value">{completedProjectTasks}</span>
                        </div>
                        <div className="project-stat">
                          <span className="stat-label">Progress:</span>
                          <span className="stat-value">{progress}%</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="no-data">No projects found</p>
              )}
            </div>
          )}

          {filterType === 'active-projects' && (
            <div className="projects-list">
              {projects.filter(p => p.status === 'active').length > 0 ? (
                projects.filter(p => p.status === 'active').map(project => {
                  const projectTasks = tasks.filter(t => t.project_id === project.id);
                  const completedProjectTasks = projectTasks.filter(t => t.status === 'completed').length;
                  const progress = projectTasks.length > 0 
                    ? Math.round((completedProjectTasks / projectTasks.length) * 100)
                    : 0;

                  return (
                    <div key={project.id} className="project-card">
                      <div className="project-header">
                        <h3>{project.name}</h3>
                        <span className={`status-badge status-${project.status}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="project-description">{project.description || 'No description'}</p>
                      <div className="project-stats">
                        <div className="project-stat">
                          <span className="stat-label">Tasks:</span>
                          <span className="stat-value">{projectTasks.length}</span>
                        </div>
                        <div className="project-stat">
                          <span className="stat-label">Completed:</span>
                          <span className="stat-value">{completedProjectTasks}</span>
                        </div>
                        <div className="project-stat">
                          <span className="stat-label">Progress:</span>
                          <span className="stat-value">{progress}%</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="no-data">No active projects found</p>
              )}
            </div>
          )}

          {filterType === 'tasks' && (
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
                  {tasks.filter(t => t.status === 'in_progress').length > 0 ? (
                    tasks.filter(t => t.status === 'in_progress').map(task => (
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

          {filterType === 'team' && (
            <div className="team-list">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role === 'user').length > 0 ? (
                    users.filter(u => u.role === 'user').map(user => (
                      <tr key={user.id}>
                        <td>{user.full_name}</td>
                        <td>{user.email}</td>
                        <td>{user.department || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="no-data">No team members found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Task Distribution - Only show if no filter */}
      {!filterType && (
        <>
          <div className="manager-section">
            <h2>📊 Task Distribution</h2>
            <div className="task-distribution">
              <div className="distribution-card">
                <div className="distribution-icon">⏳</div>
                <div className="distribution-content">
                  <div className="distribution-number">{stats.pendingTasks}</div>
                  <div className="distribution-label">Pending</div>
                  <div className="distribution-percent">
                    {stats.totalTasks > 0 ? Math.round((stats.pendingTasks / stats.totalTasks) * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="distribution-card">
                <div className="distribution-icon">⚡</div>
                <div className="distribution-content">
                  <div className="distribution-number">{stats.inProgressTasks}</div>
                  <div className="distribution-label">In Progress</div>
                  <div className="distribution-percent">
                    {stats.totalTasks > 0 ? Math.round((stats.inProgressTasks / stats.totalTasks) * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="distribution-card">
                <div className="distribution-icon">✅</div>
                <div className="distribution-content">
                  <div className="distribution-number">{stats.completedTasks}</div>
                  <div className="distribution-label">Completed</div>
                  <div className="distribution-percent">
                    {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="manager-section">
            <h2>📁 My Projects</h2>
            <div className="projects-list">
              {projects.length > 0 ? (
                projects.map(project => {
                  const projectTasks = tasks.filter(t => t.project_id === project.id);
                  const completedProjectTasks = projectTasks.filter(t => t.status === 'completed').length;
                  const progress = projectTasks.length > 0 
                    ? Math.round((completedProjectTasks / projectTasks.length) * 100)
                    : 0;

                  return (
                    <div key={project.id} className="project-card">
                      <div className="project-header">
                        <h3>{project.name}</h3>
                        <span className={`status-badge status-${project.status}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="project-description">{project.description || 'No description'}</p>
                      <div className="project-stats">
                        <div className="project-stat">
                          <span className="stat-label">Tasks:</span>
                          <span className="stat-value">{projectTasks.length}</span>
                        </div>
                        <div className="project-stat">
                          <span className="stat-label">Completed:</span>
                          <span className="stat-value">{completedProjectTasks}</span>
                        </div>
                        <div className="project-stat">
                          <span className="stat-label">Progress:</span>
                          <span className="stat-value">{progress}%</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="no-data">No projects found</p>
              )}
            </div>
          </div>

          {/* Team Performance */}
          <div className="manager-section">
            <h2>👥 Team Performance</h2>
            <div className="team-performance">
              <div className="performance-card">
                <h3>Task Completion</h3>
                <div className="performance-content">
                  <div className="performance-stat">
                    <span>Completed:</span>
                    <strong>{stats.completedTasks}</strong>
                  </div>
                  <div className="performance-stat">
                    <span>In Progress:</span>
                    <strong>{stats.inProgressTasks}</strong>
                  </div>
                  <div className="performance-stat">
                    <span>Pending:</span>
                    <strong>{stats.pendingTasks}</strong>
                  </div>
                </div>
              </div>
              <div className="performance-card">
                <h3>Project Status</h3>
                <div className="performance-content">
                  <div className="performance-stat">
                    <span>Active:</span>
                    <strong>{stats.activeProjects}</strong>
                  </div>
                  <div className="performance-stat">
                    <span>Total:</span>
                    <strong>{stats.totalProjects}</strong>
                  </div>
                  <div className="performance-stat">
                    <span>Completion Rate:</span>
                    <strong>{stats.completionRate}%</strong>
                  </div>
                </div>
              </div>
              <div className="performance-card">
                <h3>Team Metrics</h3>
                <div className="performance-content">
                  <div className="performance-stat">
                    <span>Team Size:</span>
                    <strong>{stats.teamSize}</strong>
                  </div>
                  <div className="performance-stat">
                    <span>Avg Tasks/Member:</span>
                    <strong>{stats.teamSize > 0 ? Math.round(stats.totalTasks / stats.teamSize) : 0}</strong>
                  </div>
                  <div className="performance-stat">
                    <span>Avg Completion:</span>
                    <strong>{stats.completionRate}%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;
