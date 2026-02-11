import React, { useState, useEffect } from 'react';
import { attachmentService } from '../../services/api';
import '../../styles/ProjectForm.css';

const ProjectForm = ({ project, users, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner_id: '',
    status: 'active',
    start_date: '',
    end_date: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        owner_id: project.owner_id || '',
        status: project.status || 'active',
        start_date: project.start_date ? project.start_date.split('T')[0] : '',
        end_date: project.end_date ? project.end_date.split('T')[0] : ''
      });
      
      // Fetch existing attachments
      fetchExistingAttachments(project.id);
    }
  }, [project]);

  const fetchExistingAttachments = async (projectId) => {
    try {
      const attachments = await attachmentService.getProjectAttachments(projectId);
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
        alert(`${file.name} is too large (max 10MB)`);
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
        // Use project-specific delete endpoint
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/attachments/project/${attachmentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Delete failed');
        }

        setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
      } catch (error) {
        console.error('Error deleting attachment:', error);
        alert('Failed to delete attachment');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Project name is required');
      return;
    }
    if (!formData.owner_id) {
      alert('Please select a project owner');
      return;
    }

    // Prepare data with proper type conversions
    const submitData = {
      ...formData,
      owner_id: Number(formData.owner_id),
      files: selectedFiles // Include selected files
    };

    onSubmit(submitData);
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
    <form className="project-form" onSubmit={handleSubmit}>
      {/* Title Section */}
      <div className="form-section">
        <div className="form-group">
          <label htmlFor="name">Project Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter project name"
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
            placeholder="Enter project description"
            rows="4"
          />
        </div>
      </div>

      {/* Owner & Status Section */}
      <div className="form-section">
        <div className="section-title">Project Details</div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="owner_id">Project Owner *</label>
            <select
              id="owner_id"
              name="owner_id"
              value={formData.owner_id}
              onChange={handleChange}
              required
            >
              <option value="">Select owner</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="in_progress">In Progress</option>
              <option value="planning">Planning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dates Section */}
      <div className="form-section">
        <div className="section-title">Timeline</div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_date">Start Date</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_date">End Date</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
            />
          </div>
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
          {project ? 'Update Project' : 'Create Project'}
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={uploading}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
