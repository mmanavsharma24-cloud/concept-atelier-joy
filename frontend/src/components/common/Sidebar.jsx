import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/api';
import { getRoleDisplayName, getRoleBadgeColor } from '../../utils/permissions';
import '../../styles/Sidebar.css';

const Sidebar = ({ activeMenu }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/' },
    { id: 'inbox', label: 'Inbox', icon: '📬', path: '/inbox', badge: unreadCount },
    ...(isAdmin || isManager ? [{ id: 'tasks', label: 'Tasks', icon: '✓', path: '/tasks' }] : [{ id: 'my-tasks', label: 'My Tasks', icon: '✓', path: '/my-tasks' }]),
    { id: 'projects', label: 'Projects', icon: '📁', path: '/projects' },
    { id: 'analytics', label: 'Analytics', icon: '📊', path: '/analytics' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: '🔐', path: '/admin' }] : []),
    ...(isManager ? [{ id: 'manager', label: 'Manager Panel', icon: '📈', path: '/manager' }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuClick = (item) => {
    if (item.path !== '#') {
      navigate(item.path);
    }
  };

  const handleCreateTask = () => {
    setShowCreateMenu(false);
    window.open('/tasks/create', '_blank');
  };

  const handleCreateProject = () => {
    setShowCreateMenu(false);
    window.open('/projects/create', '_blank');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>ProSafe</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(item)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {(isAdmin || isManager) && (
          <div className="create-btn-container">
            <button 
              className="create-btn"
              onClick={() => setShowCreateMenu(!showCreateMenu)}
            >
              + Create
            </button>
            
            {showCreateMenu && (
              <div className="create-menu">
                <button 
                  className="create-menu-item"
                  onClick={handleCreateTask}
                >
                  <span className="create-icon">✓</span>
                  <span>Create Task</span>
                </button>
                <button 
                  className="create-menu-item"
                  onClick={handleCreateProject}
                >
                  <span className="create-icon">📁</span>
                  <span>Create Project</span>
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="user-section">
          <button 
            className="user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="user-avatar">{user?.full_name?.charAt(0) || 'U'}</span>
            <span className="user-name">{user?.full_name || 'User'}</span>
          </button>
          
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-info">
                <p className="user-email">{user?.email}</p>
                <p className="user-role-label">Role:</p>
                <span 
                  className="role-badge"
                  style={{ backgroundColor: getRoleBadgeColor(user?.role) }}
                >
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>
              <button 
                className="profile-btn"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/profile');
                }}
              >
                My Profile
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
