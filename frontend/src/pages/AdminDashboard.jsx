import { useState, useEffect } from 'react';
import { userService, projectService, taskService } from '../services/api';
import { handleAPIError, showError } from '../utils/errorHandler';
import UserProfileModal from '../components/modals/UserProfileModal';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [filterType, setFilterType] = useState(null);
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, projectsData, tasksData] = await Promise.all([
        userService.getAll(),
        projectService.getAll(),
        taskService.getAll(),
      ]);

      setUsers(usersData);
      setProjects(projectsData);
      setTasks(tasksData);

      // Organize teams by manager
      const teamsByManager = {};
      usersData.forEach(user => {
        if (user.role === 'manager') {
          teamsByManager[user.id] = {
            manager: user,
            members: usersData.filter(u => u.manager_id === user.id || (u.department === user.department && u.role === 'user'))
          };
        }
      });
      setTeams(Object.values(teamsByManager));

      // Calculate stats
      setStats({
        totalUsers: usersData.length,
        admins: usersData.filter(u => u.role === 'admin').length,
        managers: usersData.filter(u => u.role === 'manager').length,
        teamMembers: usersData.filter(u => u.role === 'user').length,
        totalProjects: projectsData.length,
        activeProjects: projectsData.filter(p => p.status === 'active').length,
        totalTasks: tasksData.length,
        completedTasks: tasksData.filter(t => t.status === 'completed').length,
        taskCompletionRate: projectsData.length > 0 
          ? Math.round((tasksData.filter(t => t.status === 'completed').length / tasksData.length) * 100)
          : 0,
      });

      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load admin data');
      showError(message);
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: '#e74c3c',
      manager: '#f39c12',
      user: '#3498db',
    };
    return colors[role] || '#95a5a6';
  };

  const handleStatCardClick = (type) => {
    let filtered = [];
    switch(type) {
      case 'all':
        filtered = users;
        break;
      case 'admin':
        filtered = users.filter(u => u.role === 'admin');
        break;
      case 'manager':
        filtered = users.filter(u => u.role === 'manager');
        break;
      case 'user':
        filtered = users.filter(u => u.role === 'user');
        break;
      default:
        filtered = users;
    }
    setFilteredEmployees(filtered);
    setFilterType(type);
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const getSearchedEmployees = () => {
    let employees = filterType === 'user' ? [] : filteredEmployees;
    
    if (!searchQuery.trim()) {
      return employees;
    }

    return employees.filter(emp => 
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.department && emp.department.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const getSearchedTeams = () => {
    if (!searchQuery.trim()) {
      return teams;
    }

    return teams.map(team => ({
      ...team,
      members: team.members.filter(member =>
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.department && member.department.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })).filter(team => team.members.length > 0);
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>🔐 Admin Dashboard</h1>
        <p>System overview and management</p>
      </div>

      {/* System Stats */}
      <div className="admin-stats">
        <div className="stat-card" onClick={() => handleStatCardClick('all')}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => handleStatCardClick('admin')}>
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <div className="stat-number">{stats.admins}</div>
            <div className="stat-label">Administrators</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => handleStatCardClick('manager')}>
          <div className="stat-icon">🟠</div>
          <div className="stat-content">
            <div className="stat-number">{stats.managers}</div>
            <div className="stat-label">Managers</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => handleStatCardClick('user')}>
          <div className="stat-icon">🟡</div>
          <div className="stat-content">
            <div className="stat-number">{stats.teamMembers}</div>
            <div className="stat-label">Team Members</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => handleStatCardClick('projects')}>
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalProjects}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.taskCompletionRate}%</div>
            <div className="stat-label">Task Completion</div>
          </div>
        </div>
      </div>

      {/* Show Employee Management only when filterType is set */}
      {filterType && filterType !== 'projects' && (
        <div className="admin-section">
          <div className="section-header-with-back">
            <button className="back-btn" onClick={() => setFilterType(null)}>
              ← Back
            </button>
            <h2>👨‍💼 {filterType === 'all' ? 'All Employees' : filterType === 'admin' ? 'Administrators' : filterType === 'manager' ? 'Managers' : 'Team Members'}</h2>
          </div>

          {/* Search Box */}
          <div className="search-box-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="employees-list">
            <div className="employees-header">
              <div className="col-name">Employee Name</div>
              <div className="col-department">Department</div>
              <div className="col-role">Role</div>
            </div>
            {filterType === 'user' ? (
              // Show teams for team members
              getSearchedTeams().length > 0 ? (
                getSearchedTeams().map(team => (
                  <div key={team.manager.id} className="team-section">
                    <div className="team-header">
                      <strong>{team.manager.full_name}'s Team</strong> - {team.members.length} members
                    </div>
                    {team.members.map(member => (
                      <div 
                        key={member.id}
                        className="employee-row"
                        onClick={() => handleEmployeeClick(member)}
                      >
                        <div className="col-name">{member.full_name}</div>
                        <div className="col-department">{member.department || '-'}</div>
                        <div className="col-role">
                          <span 
                            className="role-badge"
                            style={{ backgroundColor: getRoleBadgeColor(member.role) }}
                          >
                            {member.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="no-employees">No team members found matching "{searchQuery}"</div>
              )
            ) : (
              // Show regular employee list for other filters
              getSearchedEmployees().length > 0 ? (
                getSearchedEmployees().map(user => (
                  <div 
                    key={user.id}
                    className="employee-row"
                    onClick={() => handleEmployeeClick(user)}
                  >
                    <div className="col-name">{user.full_name}</div>
                    <div className="col-department">{user.department || '-'}</div>
                    <div className="col-role">
                      <span 
                        className="role-badge"
                        style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-employees">No employees found {searchQuery ? `matching "${searchQuery}"` : ''}</div>
              )
            )}
          </div>
        </div>
      )}

      {/* Show Projects only when filterType is 'projects' */}
      {filterType === 'projects' && (
        <div className="admin-section">
          <div className="section-header-with-back">
            <button className="back-btn" onClick={() => setFilterType(null)}>
              ← Back
            </button>
            <h2>📁 Projects Overview</h2>
          </div>
          <div className="projects-table">
            <table>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Tasks</th>
                  <th>Completed</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {projects.length > 0 ? (
                  projects.map(project => {
                    const projectTasks = tasks.filter(t => t.project_id === project.id);
                    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
                    const progress = projectTasks.length > 0 
                      ? Math.round((completedTasks / projectTasks.length) * 100)
                      : 0;

                    return (
                      <tr key={project.id}>
                        <td className="project-name">{project.name}</td>
                        <td>{project.owner_name}</td>
                        <td>
                          <span className={`status-badge status-${project.status}`}>
                            {project.status}
                          </span>
                        </td>
                        <td>{projectTasks.length}</td>
                        <td>{completedTasks}</td>
                        <td>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${progress}%` }}
                            >
                              {progress}%
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">No projects found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Health - Always visible */}
      <div className="admin-section">
        <h2>📊 System Health</h2>
        <div className="health-grid">
          <div className="health-card" onClick={() => handleStatCardClick('admin')}>
            <h3>User Distribution</h3>
            <div className="health-content">
              <p>Admins: <strong>{stats.admins}</strong></p>
              <p>Managers: <strong>{stats.managers}</strong></p>
              <p>Team Members: <strong>{stats.teamMembers}</strong></p>
            </div>
          </div>
          <div className="health-card" onClick={() => handleStatCardClick('projects')}>
            <h3>Project Status</h3>
            <div className="health-content">
              <p>Active: <strong>{stats.activeProjects}</strong></p>
              <p>Total: <strong>{stats.totalProjects}</strong></p>
              <p>Completion Rate: <strong>{stats.taskCompletionRate}%</strong></p>
            </div>
          </div>
          <div className="health-card">
            <h3>Task Statistics</h3>
            <div className="health-content">
              <p>Total Tasks: <strong>{stats.totalTasks}</strong></p>
              <p>Completed: <strong>{stats.completedTasks}</strong></p>
              <p>Pending: <strong>{stats.totalTasks - stats.completedTasks}</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Details Modal */}
      <UserProfileModal 
        userId={selectedEmployee?.id}
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onUpdate={fetchData}
      />
    </div>
  );
};

export default AdminDashboard;
