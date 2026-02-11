import { useState, useEffect } from 'react';
import { subtaskService } from '../../services/api';
import { handleAPIError, showError, showSuccess } from '../../utils/errorHandler';
import '../styles/Subtasks.css';

const Subtasks = ({ taskId, onSubtaskChange }) => {
  const [subtasks, setSubtasks] = useState([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0, percentage: 0 });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_to: ''
  });

  useEffect(() => {
    fetchSubtasks();
    fetchProgress();
  }, [taskId]);

  const fetchSubtasks = async () => {
    try {
      setLoading(true);
      const data = await subtaskService.getAll(taskId);
      setSubtasks(data);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load subtasks');
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const data = await subtaskService.getProgress(taskId);
      setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showError('Subtask title is required');
      return;
    }

    try {
      await subtaskService.create(taskId, formData);
      showSuccess('Subtask created successfully');
      setFormData({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
      setShowForm(false);
      await fetchSubtasks();
      await fetchProgress();
      if (onSubtaskChange) onSubtaskChange();
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to create subtask');
      showError(message);
    }
  };

  const handleUpdateSubtask = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showError('Subtask title is required');
      return;
    }

    try {
      await subtaskService.update(taskId, editingId, formData);
      showSuccess('Subtask updated successfully');
      setFormData({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
      setEditingId(null);
      await fetchSubtasks();
      await fetchProgress();
      if (onSubtaskChange) onSubtaskChange();
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to update subtask');
      showError(message);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    if (!window.confirm('Are you sure you want to delete this subtask?')) return;

    try {
      await subtaskService.delete(taskId, subtaskId);
      showSuccess('Subtask deleted successfully');
      await fetchSubtasks();
      await fetchProgress();
      if (onSubtaskChange) onSubtaskChange();
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to delete subtask');
      showError(message);
    }
  };

  const handleStatusChange = async (subtaskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    try {
      await subtaskService.update(taskId, subtaskId, { status: newStatus });
      await fetchSubtasks();
      await fetchProgress();
      if (onSubtaskChange) onSubtaskChange();
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to update subtask status');
      showError(message);
    }
  };

  const handleEditSubtask = (subtask) => {
    setFormData({
      title: subtask.title,
      description: subtask.description || '',
      priority: subtask.priority || 'medium',
      due_date: subtask.due_date ? subtask.due_date.split('T')[0] : '',
      assigned_to: subtask.assigned_to || ''
    });
    setEditingId(subtask.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="subtasks-section">
      <div className="subtasks-header">
        <h3>Subtasks</h3>
        <div className="subtasks-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          <span className="progress-text">{progress.completed}/{progress.total}</span>
        </div>
      </div>

      {loading ? (
        <div className="subtasks-loading">Loading subtasks...</div>
      ) : (
        <>
          {subtasks.length > 0 && (
            <div className="subtasks-list">
              {subtasks.map(subtask => (
                <div key={subtask.id} className={`subtask-item status-${subtask.status}`}>
                  <div className="subtask-checkbox">
                    <input
                      type="checkbox"
                      checked={subtask.status === 'completed'}
                      onChange={() => handleStatusChange(subtask.id, subtask.status)}
                      className="subtask-checkbox-input"
                    />
                  </div>
                  <div className="subtask-content">
                    <div className="subtask-title">{subtask.title}</div>
                    {subtask.description && (
                      <div className="subtask-description">{subtask.description}</div>
                    )}
                    <div className="subtask-meta">
                      {subtask.assigned_to_name && (
                        <span className="subtask-assigned">👤 {subtask.assigned_to_name}</span>
                      )}
                      {subtask.due_date && (
                        <span className="subtask-due-date">📅 {new Date(subtask.due_date).toLocaleDateString()}</span>
                      )}
                      <span className={`subtask-priority priority-${subtask.priority}`}>
                        {subtask.priority}
                      </span>
                    </div>
                  </div>
                  <div className="subtask-actions">
                    <button
                      className="btn-edit-subtask"
                      onClick={() => handleEditSubtask(subtask)}
                      title="Edit subtask"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete-subtask"
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      title="Delete subtask"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showForm && (
            <button
              className="btn-add-subtask"
              onClick={() => setShowForm(true)}
            >
              + Add Subtask
            </button>
          )}

          {showForm && (
            <form className="subtask-form" onSubmit={editingId ? handleUpdateSubtask : handleAddSubtask}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Subtask title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="form-select"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Priority</option>
                  </select>
                </div>

                <div className="form-group">
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? 'Update Subtask' : 'Create Subtask'}
                </button>
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default Subtasks;
