import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/api';
import { getRoleDisplayName, getRoleBadgeColor } from '../../utils/permissions';

const Sidebar = ({ activeMenu }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
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

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleMenuClick = (item) => { if (item.path !== '#') navigate(item.path); };
  const handleCreateTask = () => { setShowCreateMenu(false); window.open('/tasks/create', '_blank'); };
  const handleCreateProject = () => { setShowCreateMenu(false); window.open('/projects/create', '_blank'); };

  return (
    <div className="w-[250px] bg-gradient-to-br from-indigo-500 to-purple-700 text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto shadow-[4px_0_15px_rgba(102,126,234,0.3)] max-md:w-[200px] max-sm:w-[60px]">
      <div className="p-5 border-b border-white/10 shrink-0">
        <h2 className="m-0 text-2xl font-bold text-white max-md:text-xl max-sm:text-base max-sm:text-center">ProSafe</h2>
      </div>

      <nav className="flex-1 py-5 flex flex-col overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`flex items-center gap-3 py-3 px-5 bg-transparent border-none text-gray-200 cursor-pointer text-sm transition-all text-left hover:bg-white/15 hover:pl-6 max-md:py-2.5 max-md:px-4 max-md:text-[13px] max-sm:justify-center max-sm:p-3 ${
              activeMenu === item.id ? 'bg-white/25 text-white border-l-4 border-white pl-4 max-md:pl-[11px] max-sm:pl-3 max-sm:border-l-4' : ''
            }`}
            onClick={() => handleMenuClick(item)}
          >
            <span className="text-lg min-w-[20px]">{item.icon}</span>
            <span className="font-medium max-sm:hidden">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className="inline-block bg-red-500 text-white rounded-full px-2 py-0.5 text-[11px] font-bold ml-auto min-w-[20px] text-center">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-5 border-t border-white/10 shrink-0 max-sm:p-2.5">
        {(isAdmin || isManager) && (
          <div className="relative mb-4">
            <button
              className="w-full py-2.5 bg-gradient-to-br from-pink-400 to-rose-500 text-white border-none rounded-md text-sm font-bold cursor-pointer transition-all shadow-[0_4px_15px_rgba(245,87,108,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(245,87,108,0.4)] max-sm:p-2 max-sm:text-xs"
              onClick={() => setShowCreateMenu(!showCreateMenu)}
            >
              + Create
            </button>

            {showCreateMenu && (
              <div className="absolute bottom-full left-0 right-0 bg-slate-700 border border-slate-800 rounded mb-1 shadow-[0_-2px_10px_rgba(0,0,0,0.2)] z-[1000] overflow-hidden">
                <button className="w-full py-3 px-4 bg-transparent border-none border-b border-slate-800 text-gray-200 cursor-pointer text-[13px] font-medium flex items-center gap-2.5 transition-all text-left hover:bg-blue-500 hover:text-white hover:pl-5" onClick={handleCreateTask}>
                  <span className="text-base min-w-[20px]">✓</span><span>Create Task</span>
                </button>
                <button className="w-full py-3 px-4 bg-transparent border-none text-gray-200 cursor-pointer text-[13px] font-medium flex items-center gap-2.5 transition-all text-left hover:bg-blue-500 hover:text-white hover:pl-5" onClick={handleCreateProject}>
                  <span className="text-base min-w-[20px]">📁</span><span>Create Project</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 relative">
          <button
            className="w-full flex items-center gap-2.5 p-2.5 bg-white/10 border-none text-gray-200 cursor-pointer rounded-md transition-all hover:bg-white/20 max-sm:justify-center max-sm:p-2"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center font-bold text-sm max-sm:w-7 max-sm:h-7 max-sm:text-xs">{user?.full_name?.charAt(0) || 'U'}</span>
            <span className="flex-1 text-left text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis max-sm:hidden">{user?.full_name || 'User'}</span>
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 bg-indigo-500/95 border border-white/20 rounded-lg mb-1 shadow-[0_-8px_32px_rgba(102,126,234,0.3)] z-[1000] backdrop-blur-[10px]">
              <div className="p-2.5 border-b border-slate-800">
                <p className="m-0 text-xs text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">{user?.email}</p>
                <p className="mt-2 mb-1 text-[11px] text-gray-400 uppercase font-semibold tracking-wider">Role:</p>
                <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold text-white uppercase tracking-wider" style={{ backgroundColor: getRoleBadgeColor(user?.role) }}>
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>
              <button className="w-full p-2.5 bg-gradient-to-br from-indigo-500 to-purple-700 border-none border-b border-white/10 text-white cursor-pointer text-[13px] font-medium transition-all hover:-translate-y-0.5" onClick={() => { setShowUserMenu(false); navigate('/profile'); }}>
                My Profile
              </button>
              <button className="w-full p-2.5 bg-gradient-to-br from-pink-400 to-rose-500 border-none text-white cursor-pointer text-[13px] font-medium transition-all rounded-b-lg hover:-translate-y-0.5" onClick={handleLogout}>
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
