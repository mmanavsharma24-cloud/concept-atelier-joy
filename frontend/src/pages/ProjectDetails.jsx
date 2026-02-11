import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService, userService, attachmentService } from '../services/api';
import { usePermission } from '../hooks/usePermission';
import ProjectAttachments from '../components/modals/ProjectAttachments';
import { handleAPIError, showError, showSuccess } from '../utils/errorHandler';
import '../styles/Projects.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermission();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'normal',
    due_date: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchProjectDetails();
    fetchUsers();
  }, [id]);

  const fetchUsers = async () => {
    try {
      const usersData = await userService.getAll();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const projectData = await projectService.getById(id);
      const tasksData = await projectService.getProjectTasks(id);
      setProject(projectData);
      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load project');
      showError(message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.delete(id);
        showSuccess('Project deleted successfully');
        navigate('/projects');
      } catch (error) {
        const { message } = handleAPIError(error, 'Failed to delete project');
        showError(message);
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      if (!newTask.title.trim()) {
        showError('Task title is required');
        return;
      }

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        project_id: parseInt(id),
        assigned_to: newTask.assigned_to ? parseInt(newTask.assigned_to) : null,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        status: 'pending',
      };

      const createdTask = await projectService.createTask(taskData);
      
      // Upload files if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            await attachmentService.upload(createdTask.id, file);
          } catch (error) {
            console.error('Error uploading file:', error);
            showError(`Failed to upload file: ${file.name}`);
          }
        }
      }

      showSuccess('Task created successfully');
      setNewTask({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'normal',
        due_date: '',
      });
      setSelectedFiles([]);
      setShowCreateTask(false);
      fetchProjectDetails();
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to create task');
      showError(message);
    }
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="loading">Project not found</div>;

  return (
    <div className="project-details-page">
      <div className="project-details-top-bar">
        <button className="back-button" onClick={() => navigate('/projects')}>
          ← Back to Projects
        </button>
      </div>

      <div className="project-details-main">
        <div className="project-details-wrapper">
          {/* Project Info Section */}
          <div className="project-info-section-full">
            <div className="project-header-full">
              <h1>{project.name}</h1>
              <span className={`status-badge status-${project.status}`}>{project.status}</span>
            </div>

            <p className="project-description-full">
              {project.description || 'No description'}
            </p>

            <div className="project-details-grid">
              <div className="detail-item">
                <label>Owner</label>
                <span>{project.owner_name}</span>
              </div>

              <div className="detail-item">
                <label>Status</label>
                <span className={`status-badge status-${project.status}`}>
                  {project.status}
                </span>
              </div>

              {project.start_date && (
                <div className="detail-item">
                  <label>Start Date</label>
                  <span>{new Date(project.start_date).toLocaleDateString()}</span>
                </div>
              )}

              {project.end_date && (
                <div className="detail-item">
                  <label>End Date</label>
                  <span>{new Date(project.end_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="project-actions-full">
              <button
                className="btn-secondary"
                onClick={() => navigate(`/projects/${id}/edit`)}
              >
                Edit Project
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
              >
                Delete Project
              </button>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="project-content-grid">
            {/* Left Column - Attachments */}
            <div className="project-attachments-section">
              <h2>Attachments</h2>
              <ProjectAttachments 
                projectId={id}
                canEdit={can('projects', 'update')}
                onAttachmentChange={fetchProjectDetails}
              />
            </div>

            {/* Right Column - Tasks */}
            <div className="project-tasks-section-full">
              <div className="tasks-header">
                <h2>Project Tasks</h2>
                <button 
                  className="btn-create-task"
                  onClick={() => setShowCreateTask(!showCreateTask)}
                >
                  + Create Task
                </button>
              </div>

              {showCreateTask && (
                <form className="create-task-form" onSubmit={handleCreateTask}>
                  <div className="form-group">
                    <label>Task Title *</label>
                    <input
                      type="text"
                      placeholder="Enter task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      placeholder="Enter task description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Assign To</label>
                      <select
                        value={newTask.assigned_to}
                        onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                      >
                        <option value="">Select team member</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Attach Files</label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                      className="file-input"
                    />
                    <p className="file-input-hint">You can select multiple files</p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="selected-files">
                      <label>Selected Files ({selectedFiles.length})</label>
                      <ul className="files-list">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="file-item">
                            <span className="file-name">📎 {file.name}</span>
                            <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                            <button
                              type="button"
                              className="btn-remove-file"
                              onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="submit" className="btn-submit">Create Task</button>
                    <button 
                      type="button" 
                      className="btn-cancel"
                      onClick={() => setShowCreateTask(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="tasks-list-full">
                {tasks.length > 0 ? (
                  tasks.map(task => (
                    <div key={task.id} className="task-item-full">
                      <div className="task-header-full">
                        <h3>{task.title}</h3>
                        <span className={`task-status status-${task.status}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="task-description-full">
                        {task.description || 'No description'}
                      </p>
                      <div className="task-meta-full">
                        {task.assigned_to_name && (
                          <span className="meta-badge">👤 {task.assigned_to_name}</span>
                        )}
                        {task.priority && (
                          <span className={`meta-badge priority-${task.priority}`}>
                            ⚡ {task.priority}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="meta-badge">
                            📅 {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-tasks-full">No tasks in this project yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
