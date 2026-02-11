import React, { useState, useEffect } from 'react';
import { attachmentService } from '../../services/api';
import { showError, showSuccess } from '../../utils/errorHandler';

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
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
    if (!formData.title.trim()) { alert('Task title is required'); return; }
    if (!formData.project_id) { alert('Please select a project'); return; }

    const submitData = {
      ...formData,
      project_id: Number(formData.project_id),
      assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
      files: selectedFiles
    };

    try {
      onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', txt: '📋', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', zip: '📦' };
    return icons[ext] || '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const inputClasses = "w-full p-2.5 border border-gray-300 rounded text-sm font-inherit transition-colors duration-300 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10";

  return (
    <form className="flex flex-col gap-0" onSubmit={handleSubmit}>
      {/* Title Section */}
      <div className="py-5 border-b border-gray-100">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="font-bold text-slate-800 text-sm">Task Title *</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Enter task title" required className={inputClasses} />
        </div>
      </div>

      {/* Description Section */}
      <div className="py-5 border-b border-gray-100">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="font-bold text-slate-800 text-sm">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Enter task description" rows="4" className={`${inputClasses} resize-y min-h-[80px]`} />
        </div>
      </div>

      {/* Project & Assignee Section */}
      <div className="py-5 border-b border-gray-100">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Assignment</div>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="project_id" className="font-bold text-slate-800 text-sm">Project *</label>
            <select id="project_id" name="project_id" value={formData.project_id} onChange={handleChange} required className={inputClasses}>
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="assigned_to" className="font-bold text-slate-800 text-sm">Assign To</label>
            <select id="assigned_to" name="assigned_to" value={formData.assigned_to} onChange={handleChange} className={inputClasses}>
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.full_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status & Priority Section */}
      <div className="py-5 border-b border-gray-100">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Status & Priority</div>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="font-bold text-slate-800 text-sm">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputClasses}>
              <option value="pending">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Done</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="priority" className="font-bold text-slate-800 text-sm">Priority</label>
            <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className={inputClasses}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Due Date Section */}
      <div className="py-5 border-b border-gray-100">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="due_date" className="font-bold text-slate-800 text-sm">Due Date</label>
          <input type="date" id="due_date" name="due_date" value={formData.due_date} onChange={handleChange} className={inputClasses} />
        </div>
      </div>

      {/* File Attachments Section */}
      <div className="py-5 border-b border-gray-100">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Attachments</div>
        
        {existingAttachments.length > 0 && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <h4 className="m-0 mb-2.5 text-[13px] text-slate-800 font-semibold">Current Attachments ({existingAttachments.length})</h4>
            <div className="flex flex-col gap-2">
              {existingAttachments.map(attachment => (
                <div key={attachment.id} className="flex items-center gap-2.5 p-2.5 bg-blue-50 border border-blue-100 rounded">
                  <span className="text-xl min-w-[24px] text-center">{getFileIcon(attachment.file_name)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-slate-800 break-words">{attachment.file_name}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{formatFileSize(attachment.file_size)}</div>
                  </div>
                  <button type="button" onClick={() => removeExistingAttachment(attachment.id)} title="Delete attachment" className="w-7 h-7 border-none bg-gray-100 text-red-500 rounded cursor-pointer text-base transition-all duration-300 shrink-0 hover:bg-red-500 hover:text-white">
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-5 bg-white border-2 border-dashed border-blue-500 rounded-md text-center cursor-pointer transition-all duration-300 hover:bg-gray-100 hover:border-blue-600">
          <input type="file" id="file-input" multiple onChange={handleFileSelect} disabled={uploading} style={{ display: 'none' }} />
          <label htmlFor="file-input" className="block cursor-pointer font-medium text-blue-500 mb-2">
            {uploading ? 'Uploading...' : '+ Click to select files or drag & drop'}
          </label>
          <p className="m-0 text-xs text-gray-500">Max 10MB per file. Supported: PDF, Word, Excel, Images, ZIP</p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="m-0 mb-2.5 text-[13px] text-slate-800 font-semibold">New Files ({selectedFiles.length})</h4>
            <div className="flex flex-col gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2.5 p-2.5 bg-white border border-gray-100 rounded">
                  <span className="text-xl min-w-[24px] text-center">{getFileIcon(file.name)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-slate-800 break-words">{file.name}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{formatFileSize(file.size)}</div>
                  </div>
                  <button type="button" onClick={() => removeFile(index)} className="w-7 h-7 border-none bg-gray-100 text-red-500 rounded cursor-pointer text-base transition-all duration-300 shrink-0 hover:bg-red-500 hover:text-white">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 mt-2.5">
        <button type="submit" disabled={uploading} className="flex-1 p-3 bg-blue-500 text-white border-none rounded text-sm font-bold cursor-pointer transition-colors duration-300 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {task ? 'Update Task' : 'Create Task'}
        </button>
        <button type="button" onClick={onCancel} disabled={uploading} className="flex-1 p-3 bg-gray-100 text-slate-800 border-none rounded text-sm font-bold cursor-pointer transition-colors duration-300 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
