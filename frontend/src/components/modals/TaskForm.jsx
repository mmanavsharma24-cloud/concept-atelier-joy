import React, { useState, useEffect } from 'react';
import { attachmentService } from '../../services/api';
import { showError, showSuccess } from '../../utils/errorHandler';
import '../../styles/TaskForm.css';

const TaskForm = ({ task, users, projects, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assigned_to: '',
    status: 'pending',
    priority: 'medium',
    due_date: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        project_id: task.project_id || '',
        assigned_to: task.assigned_to || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date ? task.due_date.split('T')[0] : ''
      });
      
      // Fetch existing attachments
      fetchExistingAttachments(task.id);
    }
  }, [task]);

  const fetchExistingAttachments = async (taskId) => {
    try {
      const attachments = await attachmentService.getByTask(taskId);
      setExistingAttachments(attachments);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file sizes
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        showError(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await attachmentService.delete(attachmentId);
        setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
        showSuccess('Attachment deleted successfully');
      } catch (error) {
        console.error('Error deleting attachment:', error);
        showError('Failed to delete attachment');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Task title is required');
      return;
    }
    if (!formData.project_id) {
      alert('Please select a project');
      return;
    }

    // Prepare data with proper type conversions
    const submitData = {
      ...formData,
      project_id: Number(formData.project_id),
      assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
      files: selectedFiles // Include selected files
    };

    // If editing existing task, submit form data first
    if (task) {
      onSubmit(submitData);
      return;
    }

    // For new tasks, submit form data and files
    try {
      onSubmit(submitData);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      txt: '📋',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      zip: '📦',
    };
    return icons[ext] || '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {/* Title Section */}
      <div className="form-section">
        <div className="form-group">
          <label htmlFor="title">Task Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
          />
        </div>
      </div>

      {/* Description Section */}
      <div className="form-section">
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows="4"
          />
        </div>
      </div>

      {/* Project & Assignee Section */}
      <div className="form-section">
        <div className="section-title">Assignment</div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="project_id">Project *</label>
            <select
              id="project_id"
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assigned_to">Assign To</label>
            <select
              id="assigned_to"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status & Priority Section */}
      <div className="form-section">
        <div className="section-title">Status & Priority</div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Done</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Due Date Section */}
      <div className="form-section">
        <div className="form-group">
          <label htmlFor="due_date">Due Date</label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* File Attachments Section */}
      <div className="form-section">
        <div className="section-title">Attachments</div>
        
        {/* Existing Attachments */}
        {existingAttachments.length > 0 && (
          <div className="existing-files">
            <h4>Current Attachments ({existingAttachments.length})</h4>
            <div className="files-list">
              {existingAttachments.map(attachment => (
                <div key={attachment.id} className="file-item existing-file">
                  <span className="file-icon">{getFileIcon(attachment.file_name)}</span>
                  <div className="file-info">
                    <div className="file-name">{attachment.file_name}</div>
                    <div className="file-size">{formatFileSize(attachment.file_size)}</div>
                  </div>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => removeExistingAttachment(attachment.id)}
                    title="Delete attachment"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Upload Area */}
        <div className="file-upload-area">
          <input
            type="file"
            id="file-input"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input" className="file-upload-label">
            {uploading ? 'Uploading...' : '+ Click to select files or drag & drop'}
          </label>
          <p className="file-hint">Max 10MB per file. Supported: PDF, Word, Excel, Images, ZIP</p>
        </div>

        {/* New Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <h4>New Files ({selectedFiles.length})</h4>
            <div className="files-list">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-icon">{getFileIcon(file.name)}</span>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{formatFileSize(file.size)}</div>
                  </div>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => removeFile(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={uploading}>
          {task ? 'Update Task' : 'Create Task'}
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={uploading}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
