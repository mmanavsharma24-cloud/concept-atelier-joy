import { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import { handleAPIError, showError, showSuccess } from '../utils/errorHandler';

const Inbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { fetchNotifications(); fetchUnreadCount(); }, [activeTab, priorityFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let data;
      if (activeTab === 'archived') { data = await notificationService.getArchived(); }
      else { data = await notificationService.getAll(activeTab, priorityFilter); }
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load notifications');
      showError(message);
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try { const data = await notificationService.getUnreadCount(); setUnreadCount(data.unread_count); }
    catch (error) { console.error('Error fetching unread count:', error); }
  };

  const handleMarkAsRead = async (id) => { try { await notificationService.markAsRead(id); setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n)); await fetchUnreadCount(); showSuccess('Marked as read'); } catch (error) { const { message } = handleAPIError(error, 'Failed to mark as read'); showError(message); } };
  const handleMarkAllAsRead = async () => { try { await notificationService.markAllAsRead(); setNotifications(notifications.map(n => ({ ...n, is_read: true }))); setUnreadCount(0); showSuccess('All marked as read'); } catch (error) { const { message } = handleAPIError(error, 'Failed to mark all as read'); showError(message); } };
  const handleArchive = async (id) => { try { await notificationService.archive(id); setNotifications(notifications.filter(n => n.id !== id)); await fetchUnreadCount(); showSuccess('Notification archived'); } catch (error) { const { message } = handleAPIError(error, 'Failed to archive'); showError(message); } };
  const handleRestore = async (id) => { try { await notificationService.restore(id); setNotifications(notifications.filter(n => n.id !== id)); showSuccess('Notification restored'); } catch (error) { const { message } = handleAPIError(error, 'Failed to restore'); showError(message); } };
  const handleClearAll = async () => { if (window.confirm('Are you sure you want to clear all notifications?')) { try { await notificationService.clearAll(); setNotifications([]); setUnreadCount(0); showSuccess('All notifications cleared'); } catch (error) { const { message } = handleAPIError(error, 'Failed to clear notifications'); showError(message); } } };

  const getNotificationIcon = (type) => ({ assignment: '📋', comment: '💬', update: '🔄', mention: '👤', approval: '✅' }[type] || '📬');
  const getNotificationColor = (type) => ({ assignment: '#3498db', comment: '#9b59b6', update: '#f39c12', mention: '#e74c3c', approval: '#27ae60' }[type] || '#95a5a6');
  const getPriorityLabel = (priority) => ({ urgent: '🔴 Urgent', high: '🟠 High', normal: '🔵 Normal', low: '⚪ Low' }[priority] || priority);
  const priorityBadgeColors = { urgent: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', normal: 'bg-blue-100 text-blue-700', low: 'bg-gray-100 text-gray-600' };

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'assignment', label: 'Assignments', count: notifications.filter(n => n.type === 'assignment').length },
    { id: 'comment', label: 'Comments', count: notifications.filter(n => n.type === 'comment').length },
    { id: 'update', label: 'Updates', count: notifications.filter(n => n.type === 'update').length },
    { id: 'mention', label: 'Mentions', count: notifications.filter(n => n.type === 'mention').length },
    { id: 'archived', label: 'Archived', count: 0 },
  ];

  if (loading) return <div className="text-center p-10 text-gray-500 text-base">Loading inbox...</div>;

  return (
    <div className="p-5 max-w-[1000px] mx-auto max-md:p-4">
      <div className="flex justify-between items-center mb-8 max-md:flex-col max-md:items-start max-md:gap-4">
        <h1 className="text-3xl text-slate-800 m-0">📬 Inbox</h1>
        <div className="flex gap-2.5 max-md:w-full">
          {unreadCount > 0 && <button className="py-2 px-4 border-none rounded-md cursor-pointer text-sm font-medium transition-all bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(52,152,219,0.3)] max-md:flex-1" onClick={handleMarkAllAsRead}>Mark all as read</button>}
          {notifications.length > 0 && <button className="py-2 px-4 border-none rounded-md cursor-pointer text-sm font-medium transition-all bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(231,76,60,0.3)] max-md:flex-1" onClick={handleClearAll}>Clear all</button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 mb-6 border-b-2 border-gray-200 overflow-x-auto pb-2.5">
        {tabs.map(tab => (
          <button key={tab.id} className={`py-2.5 px-4 bg-transparent border-none cursor-pointer text-sm font-medium border-b-[3px] transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-blue-500 border-b-blue-500' : 'text-gray-500 border-b-transparent hover:text-slate-800'}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
            {tab.count > 0 && <span className="inline-block bg-red-500 text-white rounded-full px-2 py-0.5 text-xs ml-1.5 font-semibold">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Priority Filter */}
      {activeTab !== 'archived' && (
        <div className="flex gap-2.5 mb-5 items-center flex-wrap">
          <span className="font-semibold text-slate-800 text-sm">Priority:</span>
          {['all', 'urgent', 'high', 'normal', 'low'].map(p => (
            <button key={p} className={`py-1.5 px-3 border rounded-md cursor-pointer text-[13px] font-medium transition-all ${priorityFilter === p ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:bg-gray-50'} max-md:flex-1 max-md:min-w-[80px]`} onClick={() => setPriorityFilter(p)}>
              {p === 'all' ? 'All' : `${p === 'urgent' ? '🔴' : p === 'high' ? '🟠' : p === 'normal' ? '🔵' : '⚪'} ${p.charAt(0).toUpperCase() + p.slice(1)}`}
            </button>
          ))}
        </div>
      )}

      {/* Notifications */}
      <div className="flex flex-col gap-3">
        {notifications.length > 0 ? notifications.map(notification => (
          <div key={notification.id} className={`flex gap-4 p-4 bg-white border border-gray-200 rounded-lg transition-all cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:border-gray-400 max-md:flex-col max-md:gap-3 ${!notification.is_read ? 'bg-gray-50 border-l-4 border-l-blue-500' : ''}`}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 text-white" style={{ backgroundColor: getNotificationColor(notification.type) }}>
              {getNotificationIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1.5 gap-2.5 max-md:flex-col">
                <h3 className="m-0 text-[15px] font-semibold text-slate-800">{notification.title}</h3>
                <div className="flex gap-2.5 items-center shrink-0 max-md:flex-col max-md:items-start">
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap ${priorityBadgeColors[notification.priority || 'normal'] || ''}`}>{getPriorityLabel(notification.priority || 'normal')}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(notification.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="m-0 mb-2 text-sm text-gray-600 leading-relaxed">{notification.message}</p>
              {notification.task_title && <div className="flex gap-2 flex-wrap"><span className="inline-block bg-gray-100 text-slate-800 px-2.5 py-1 rounded text-xs font-medium">📋 {notification.task_title}</span></div>}
              {notification.project_name && <div className="flex gap-2 flex-wrap mt-1"><span className="inline-block bg-gray-100 text-slate-800 px-2.5 py-1 rounded text-xs font-medium">📁 {notification.project_name}</span></div>}
            </div>

            <div className="flex gap-2 shrink-0 max-md:justify-end">
              {activeTab !== 'archived' && !notification.is_read && (
                <button className="w-9 h-9 border border-gray-200 bg-white rounded-md cursor-pointer text-base transition-all flex items-center justify-center hover:bg-gray-50 hover:border-gray-400" title="Mark as read" onClick={() => handleMarkAsRead(notification.id)}>✓</button>
              )}
              {activeTab === 'archived' ? (
                <button className="w-9 h-9 border border-gray-200 bg-white rounded-md cursor-pointer text-base transition-all flex items-center justify-center hover:bg-green-100 hover:border-green-500" title="Restore" onClick={() => handleRestore(notification.id)}>↩️</button>
              ) : (
                <button className="w-9 h-9 border border-gray-200 bg-white rounded-md cursor-pointer text-base transition-all flex items-center justify-center hover:bg-yellow-100 hover:border-yellow-500" title="Archive" onClick={() => handleArchive(notification.id)}>📦</button>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-16 px-5 text-gray-500">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl text-slate-800 mb-2">No notifications</h3>
            <p className="text-sm">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
