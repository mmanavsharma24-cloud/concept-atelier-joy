import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../services/api';
import { usePermission } from '../hooks/usePermission';
import TaskComments from '../components/modals/TaskComments';
import Subtasks from '../components/modals/Subtasks';
import { handleAPIError, showError, showSuccess } from '../utils/errorHandler';
import '../styles/Tasks.css';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermission();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const taskData = await taskService.getById(id);
      setTask(taskData);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load task');
      showError(message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.delete(id);
        showSuccess('Task deleted successfully');
        navigate('/tasks');
      } catch (error) {
        const { message } = handleAPIError(error, 'Failed to delete task');
        showError(message);
      }
    }
  };

  if (loading) return <div className="loading">Loading task...</div>;
  if (!task) return <div className="loading">Task not found</div>;

  return (
    <div className="task-details-page">
      <div className="task-details-top-bar">
        <button className="back-button" onClick={() => navigate('/tasks')}>
          ← Back to Tasks
        </button>
      </div>

      <div className="task-details-main">
        <div className="task-details-wrapper">
          {/* Task Info Section */}
          <div className="task-info-section-full">
            <div className="task-header-full">
              <h1>{task.title}</h1>
              <span className={`status-badge status-${task.status}`}>
                {task.status === 'pending' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Done'}
              </span>
            </div>

            <p className="task-description-full">
              {task.description || 'No description'}
            </p>

            <div className="task-details-grid">
              <div className="detail-item">
                <label>Status</label>
                <span className={`status-badge status-${task.status}`}>
                  {task.status === 'pending' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Done'}
                </span>
              </div>

              <div className="detail-item">
                <label>Priority</label>
                <span className={`priority-badge priority-${task.priority}`}>
                  {task.priority}
                </span>
              </div>

              {task.due_date && (
                <div className="detail-item">
                  <label>Due Date</label>
                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}

              <div className="detail-item">
                <label>Assigned To</label>
                <span>{task.assigned_to_name || 'Unassigned'}</span>
              </div>
            </div>

            <div className="task-actions-full">
              <button
                className="btn-secondary"
                onClick={() => window.open(`/tasks/${id}/edit`, '_blank')}
              >
                Edit Task
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
              >
                Delete Task
              </button>
            </div>
          </div>

          {/* Subtasks Section */}
          <Subtasks taskId={id} onSubtaskChange={fetchTaskDetails} />

          {/* Two Column Layout */}
          <div className="task-content-grid">
            {/* Left Column - Task Meta */}
            <div className="task-meta-section">
              <h2>Task Information</h2>
              <div className="meta-details">
                <div className="meta-item">
                  <label>Status</label>
                  <span className={`status-badge status-${task.status}`}>
                    {task.status === 'pending' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Done'}
                  </span>
                </div>
                <div className="meta-item">
                  <label>Priority</label>
                  <span className={`priority-badge priority-${task.priority}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="meta-item">
                  <label>Assigned To</label>
                  <span>{task.assigned_to_name || 'Unassigned'}</span>
                </div>
                {task.due_date && (
                  <div className="meta-item">
                    <label>Due Date</label>
                    <span>{new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Comments & Attachments */}
            <div className="task-comments-section-full">
              <TaskComments
                taskId={id}
                canEdit={can('tasks', 'update')}
                onAttachmentChange={fetchTaskDetails}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
