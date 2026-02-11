import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { taskService, projectService, userService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import KanbanBoard from '../components/kanban/KanbanBoard';
import PermissionGuard from '../components/common/PermissionGuard';
import { handleAPIError, showError } from '../utils/errorHandler';
import '../styles/Tasks.css';

const Tasks = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDueDate, setFilterDueDate] = useState('all');
  const [searchTitle, setSearchTitle] = useState('');

  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [selectedKanbanProject, setSelectedKanbanProject] = useState(null);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, [location]);

  // Refresh data when page comes back into focus
  useEffect(() => {
    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // For admin and manager: fetch all data
      // For regular users: fetch only their assigned tasks and projects
      let tasksData, projectsData;

      if (user?.role === 'user') {
        tasksData = await taskService.getUserAnalytics();
        projectsData = await projectService.getUserAnalytics();
      } else {
        tasksData = await taskService.getAll();
        projectsData = await projectService.getAll();
      }

      const usersData = await userService.getAll();

      setTasks(tasksData);
      setUsers(usersData);
      setProjects(projectsData);

      if (projectsData.length > 0) {
        setSelectedKanbanProject(projectsData[0].id);
      }

      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load tasks');
      showError(message);
      setLoading(false);
    }
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Filter by assignee (only for admin/manager)
    if (user?.role !== 'user' && filterAssignee !== 'all') {
      filtered = filtered.filter(t => t.assigned_to === Number(filterAssignee));
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    // Filter by due date
    if (filterDueDate !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(t => {
        if (!t.due_date) return filterDueDate === 'no-date';

        const dueDate = new Date(t.due_date);
        dueDate.setHours(0, 0, 0, 0);

        switch (filterDueDate) {
          case 'overdue':
            return dueDate < today;
          case 'today':
            return dueDate.getTime() === today.getTime();
          case 'this-week':
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            return dueDate >= today && dueDate <= weekEnd;
          case 'this-month':
            return (
              dueDate.getMonth() === today.getMonth() &&
              dueDate.getFullYear() === today.getFullYear()
            );
          case 'no-date':
            return !t.due_date;
          default:
            return true;
        }
      });
    }

    // Search by title
    if (searchTitle.trim()) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    return filtered;
  };

  const handleCreateTask = () => {
    window.open('/tasks/create', '_blank');
  };

  const handleTaskRowClick = (task) => {
    navigate(`/tasks/${task.id}`);
  };



  if (loading) return <div className="loading">Loading tasks...</div>;

  const filteredTasks = getFilteredTasks();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="tasks-page">
        <div className="page-header">
          <h1>Tasks</h1>
          <div className="header-actions">
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                📋 Table
              </button>
              <button
                className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
              >
                📊 Kanban
              </button>
            </div>
            <PermissionGuard resource="tasks" action="create">
              <button className="btn-primary" onClick={handleCreateTask}>
                + New Task
              </button>
            </PermissionGuard>
            <button 
              className="btn-focus"
              onClick={() => setIsFocusMode(true)}
              title="Enter Focus Mode"
            >
              🎯 Focus
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <>
            <div className="search-section">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search tasks by title..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
            </div>

            <div className="tasks-filter">
              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All ({tasks.length})</option>
                  <option value="pending">
                    To Do ({tasks.filter(t => t.status === 'pending').length})
                  </option>
                  <option value="in_progress">
                    In Progress ({tasks.filter(t => t.status === 'in_progress').length})
                  </option>
                  <option value="completed">
                    Done ({tasks.filter(t => t.status === 'completed').length})
                  </option>
                </select>
              </div>

              {user?.role !== 'user' && (
                <div className="filter-group">
                  <label>Assignee:</label>
                  <select
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                  >
                    <option value="all">All</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="filter-group">
                <label>Priority:</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Due Date:</label>
                <select
                  value={filterDueDate}
                  onChange={(e) => setFilterDueDate(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                  <option value="no-date">No Due Date</option>
                </select>
              </div>

              <button
                className="btn-reset"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterAssignee('all');
                  setFilterPriority('all');
                  setFilterDueDate('all');
                  setSearchTitle('');
                }}
              >
                Reset Filters
              </button>
            </div>

            <div className="results-info">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>

            <div className="tasks-grid">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className="task-card"
                    onClick={() => handleTaskRowClick(task)}
                  >
                    <div className="task-card-header">
                      <div className="task-card-title">{task.title}</div>
                      <span className={`status-badge-card status-${task.status}`}>
                        {task.status === 'pending' && '⏳ To Do'}
                        {task.status === 'in_progress' && '⚙️ In Progress'}
                        {task.status === 'completed' && '✓ Done'}
                      </span>
                    </div>

                    <div className="task-card-body">
                      <div className="task-card-row">
                        <span className="task-card-label">👤 Assigned To:</span>
                        <span className="task-card-value">{task.assigned_to_name || 'Unassigned'}</span>
                      </div>

                      <div className="task-card-row">
                        <span className="task-card-label">📅 Due Date:</span>
                        <span className="task-card-value">
                          {task.due_date
                            ? new Date(task.due_date).toLocaleDateString()
                            : '-'}
                        </span>
                      </div>

                      <div className="task-card-row">
                        <span className="task-card-label">🎯 Priority:</span>
                        <span className={`priority-badge-card priority-${task.priority}`}>
                          {task.priority}
                        </span>
                      </div>

                      {task.subtask_total > 0 && (
                        <div className="task-card-row">
                          <span className="task-card-label">✓ Subtasks:</span>
                          <span className="task-card-value">
                            {task.subtask_completed}/{task.subtask_total}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="task-card-footer">
                      <div className="task-card-progress">
                        {task.subtask_total > 0 && (
                          <div className="progress-bar-small">
                            <div
                              className="progress-fill-small"
                              style={{
                                width: `${(task.subtask_completed / task.subtask_total) * 100}%`
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-tasks-message">
                  <div className="no-tasks-icon">📭</div>
                  <p>No tasks found</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="kanban-header">
              <label htmlFor="kanban-project">Select Project:</label>
              <select
                id="kanban-project"
                value={selectedKanbanProject || ''}
                onChange={(e) => setSelectedKanbanProject(Number(e.target.value))}
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedKanbanProject && (
              <KanbanBoard projectId={selectedKanbanProject} users={users} />
            )}
          </>
        )}

        {/* Task Create/Edit Drawer - Removed, now opens in new tab */}

        {/* Focus Mode Fullscreen */}
        {isFocusMode && (
          <div className="focus-mode-fullscreen">
            <div className="focus-mode-header-bar">
              <h2>Focus Mode</h2>
              <button 
                className="focus-mode-close-btn"
                onClick={() => setIsFocusMode(false)}
                title="Exit Focus Mode"
              >
                ✕
              </button>
            </div>

            <div className="focus-mode-content">
              <div className="focus-mode-dual-layout">
                {/* Tasks Section */}
                <div className="focus-mode-section">
                  <h3 className="focus-section-title">Tasks</h3>
                  <div className="focus-mode-table-wrapper">
                    <table className="focus-mode-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40%' }}>Task Name</th>
                          <th style={{ width: '18%' }}>Assigned To</th>
                          <th style={{ width: '18%' }}>Due Date</th>
                          <th style={{ width: '12%' }}>Status</th>
                          <th style={{ width: '12%' }}>Subtasks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.length > 0 ? (
                          tasks.map(task => (
                            <tr key={task.id} className="focus-mode-task-row">
                              <td style={{ width: '40%' }}>{task.title}</td>
                              <td style={{ width: '18%' }}>{task.assigned_to_name || 'Unassigned'}</td>
                              <td style={{ width: '18%' }}>
                                {task.due_date
                                  ? new Date(task.due_date).toLocaleDateString()
                                  : '-'}
                              </td>
                              <td style={{ width: '12%', textAlign: 'left' }}>
                                <span className={`focus-status-badge status-${task.status}`}>
                                  {task.status === 'pending' && 'PD'}
                                  {task.status === 'in_progress' && 'IP'}
                                  {task.status === 'completed' && 'Done'}
                                </span>
                              </td>
                              <td style={{ width: '12%', textAlign: 'center' }}>
                                {task.subtask_total > 0 ? (
                                  <span className="focus-subtask-badge">
                                    {task.subtask_completed}/{task.subtask_total}
                                  </span>
                                ) : (
                                  <span className="focus-subtask-none">-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="focus-mode-no-tasks">
                              No tasks found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Projects Section */}
                <div className="focus-mode-section">
                  <h3 className="focus-section-title">Projects</h3>
                  <div className="focus-mode-table-wrapper">
                    <table className="focus-mode-table">
                      <thead>
                        <tr>
                          <th style={{ width: '50%' }}>Project Name</th>
                          <th style={{ width: '25%' }}>Lead</th>
                          <th style={{ width: '25%' }}>End Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.length > 0 ? (
                          projects.map(project => (
                            <tr key={project.id} className="focus-mode-task-row">
                              <td style={{ width: '50%' }}>{project.name}</td>
                              <td style={{ width: '25%' }}>{project.owner_name || 'N/A'}</td>
                              <td style={{ width: '25%' }}>
                                {project.end_date
                                  ? new Date(project.end_date).toLocaleDateString()
                                  : '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="focus-mode-no-tasks">
                              No projects found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default Tasks;
