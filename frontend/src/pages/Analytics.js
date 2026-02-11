import { useState, useEffect } from 'react';
import { projectService, taskService, userService } from '../services/api';
import { handleAPIError, showError } from '../utils/errorHandler';
import { useAuth } from '../hooks/useAuth';
import ProjectsOverviewChart from '../components/charts/ProjectsOverviewChart';
import TasksByStatusChart from '../components/charts/TasksByStatusChart';
import TasksByPriorityChart from '../components/charts/TasksByPriorityChart';
import TasksByAssigneeChart from '../components/charts/TasksByAssigneeChart';
import '../styles/Analytics.css';

const Analytics = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      
      const usersData = await userService.getAll();
      setProjects(projectsData);
      setTasks(tasksData);
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load analytics');
      showError(message);
      setLoading(false);
    }
  };

  const getTaskStats = () => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      critical: tasks.filter(t => t.priority === 'critical').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };
  };

  const getProjectStats = () => {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      inProgress: projects.filter(p => p.status === 'in_progress').length,
      planning: projects.filter(p => p.status === 'planning').length,
    };
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  const taskStats = getTaskStats();
  const projectStats = getProjectStats();

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>📊 Analytics & Reports</h1>
        <p>Comprehensive overview of your projects and tasks</p>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-box">
          <h3>Total Tasks</h3>
          <p className="stat-value">{taskStats.total}</p>
          <div className="stat-breakdown">
            <span>✓ {taskStats.completed} Completed</span>
            <span>⚡ {taskStats.inProgress} In Progress</span>
            <span>⏳ {taskStats.pending} Pending</span>
          </div>
        </div>

        <div className="stat-box">
          <h3>Total Projects</h3>
          <p className="stat-value">{projectStats.total}</p>
          <div className="stat-breakdown">
            <span>✓ {projectStats.active} Active</span>
            <span>⚡ {projectStats.inProgress} In Progress</span>
            <span>📋 {projectStats.planning} Planning</span>
          </div>
        </div>

        <div className="stat-box">
          <h3>Task Priority</h3>
          <p className="stat-value">{taskStats.critical}</p>
          <div className="stat-breakdown">
            <span>🔴 {taskStats.critical} Critical</span>
            <span>🟠 {taskStats.high} High</span>
            <span>🟡 {taskStats.medium} Medium</span>
          </div>
        </div>

        <div className="stat-box">
          <h3>Team Members</h3>
          <p className="stat-value">{users.length}</p>
          <div className="stat-breakdown">
            <span>👥 Active Users</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-full-grid">
        <div className="chart-full">
          <ProjectsOverviewChart projects={projects} />
        </div>
        <div className="chart-full">
          <TasksByStatusChart tasks={tasks} />
        </div>
        <div className="chart-full">
          <TasksByPriorityChart tasks={tasks} />
        </div>
        <div className="chart-full">
          <TasksByAssigneeChart tasks={tasks} users={users} />
        </div>
      </div>

      {/* Detailed Task List */}
      <div className="detailed-section">
        <h2>📋 All Tasks</h2>
        <div className="task-list-detailed">
          <table>
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <tr key={task.id}>
                    <td className="task-name">{task.title}</td>
                    <td>{task.assigned_to_name || 'Unassigned'}</td>
                    <td>
                      <span className={`priority-badge priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${task.status}`}>
                        {task.status === 'pending' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Done'}
                      </span>
                    </td>
                    <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">No tasks found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Project List */}
      <div className="detailed-section">
        <h2>📁 All Projects</h2>
        <div className="project-list-detailed">
          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map(project => (
                  <tr key={project.id}>
                    <td className="project-name">{project.name}</td>
                    <td>{project.owner_name}</td>
                    <td>
                      <span className={`status-badge status-${project.status}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>{project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}</td>
                    <td>{project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">No projects found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
