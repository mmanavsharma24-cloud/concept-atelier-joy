import { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import { handleAPIError, showError, showSuccess } from '../utils/errorHandler';
import '../styles/Inbox.css';

const Inbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [activeTab, priorityFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let data;
      if (activeTab === 'archived') {
        data = await notificationService.getArchived();
      } else {
        data = await notificationService.getAll(activeTab, priorityFilter);
      }
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load notifications');
      showError(message);
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      await fetchUnreadCount();
      showSuccess('Marked as read');
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to mark as read');
      showError(message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showSuccess('All marked as read');
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to mark all as read');
      showError(message);
    }
  };

  const handleArchive = async (id) => {
    try {
      await notificationService.archive(id);
      setNotifications(notifications.filter(n => n.id !== id));
      await fetchUnreadCount();
      showSuccess('Notification archived');
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to archive');
      showError(message);
    }
  };

  const handleRestore = async (id) => {
    try {
      await notificationService.restore(id);
      setNotifications(notifications.filter(n => n.id !== id));
      showSuccess('Notification restored');
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to restore');
      showError(message);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        await notificationService.clearAll();
        setNotifications([]);
        setUnreadCount(0);
        showSuccess('All notifications cleared');
      } catch (error) {
        const { message } = handleAPIError(error, 'Failed to clear notifications');
        showError(message);
      }
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      assignment: '📋',
      comment: '💬',
      update: '🔄',
      mention: '👤',
      approval: '✅',
    };
    return icons[type] || '📬';
  };

  const getNotificationColor = (type) => {
    const colors = {
      assignment: '#3498db',
      comment: '#9b59b6',
      update: '#f39c12',
      mention: '#e74c3c',
      approval: '#27ae60',
    };
    return colors[type] || '#95a5a6';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      urgent: '🔴 Urgent',
      high: '🟠 High',
      normal: '🔵 Normal',
      low: '⚪ Low',
    };
    return labels[priority] || priority;
  };

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'assignment', label: 'Assignments', count: notifications.filter(n => n.type === 'assignment').length },
    { id: 'comment', label: 'Comments', count: notifications.filter(n => n.type === 'comment').length },
    { id: 'update', label: 'Updates', count: notifications.filter(n => n.type === 'update').length },
    { id: 'mention', label: 'Mentions', count: notifications.filter(n => n.type === 'mention').length },
    { id: 'archived', label: 'Archived', count: 0 },
  ];

  if (loading) return <div className="loading">Loading inbox...</div>;

  return (
    <div className="inbox-page">
      <div className="page-header">
        <h1>📬 Inbox</h1>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button className="btn-secondary" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="btn-danger" onClick={handleClearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="inbox-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Priority Filter */}
      {activeTab !== 'archived' && (
        <div className="priority-filter">
          <span className="filter-label">Priority:</span>
          <button
            className={`priority-btn ${priorityFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('all')}
          >
            All
          </button>
          <button
            className={`priority-btn urgent ${priorityFilter === 'urgent' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('urgent')}
          >
            🔴 Urgent
          </button>
          <button
            className={`priority-btn high ${priorityFilter === 'high' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('high')}
          >
            🟠 High
          </button>
          <button
            className={`priority-btn normal ${priorityFilter === 'normal' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('normal')}
          >
            🔵 Normal
          </button>
          <button
            className={`priority-btn low ${priorityFilter === 'low' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('low')}
          >
            ⚪ Low
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
            >
              <div className="notification-icon" style={{ backgroundColor: getNotificationColor(notification.type) }}>
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-header">
                  <h3>{notification.title}</h3>
                  <div className="notification-meta-header">
                    <span className={`priority-badge priority-${notification.priority || 'normal'}`}>
                      {getPriorityLabel(notification.priority || 'normal')}
                    </span>
                    <span className="notification-time">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="notification-message">{notification.message}</p>
                {notification.task_title && (
                  <div className="notification-meta">
                    <span className="meta-tag">📋 {notification.task_title}</span>
                  </div>
                )}
                {notification.project_name && (
                  <div className="notification-meta">
                    <span className="meta-tag">📁 {notification.project_name}</span>
                  </div>
                )}
              </div>

              <div className="notification-actions">
                {activeTab !== 'archived' && !notification.is_read && (
                  <button
                    className="action-btn"
                    title="Mark as read"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    ✓
                  </button>
                )}
                {activeTab === 'archived' ? (
                  <button
                    className="action-btn restore"
                    title="Restore"
                    onClick={() => handleRestore(notification.id)}
                  >
                    ↩️
                  </button>
                ) : (
                  <button
                    className="action-btn archive"
                    title="Archive"
                    onClick={() => handleArchive(notification.id)}
                  >
                    📦
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
