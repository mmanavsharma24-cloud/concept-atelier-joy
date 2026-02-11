import React, { useState, useEffect } from 'react';
import { attachmentService } from '../../services/api';

const ProjectForm = ({ project, users, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', description: '', owner_id: '', status: 'active', start_date: '', end_date: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({ name: project.name || '', description: project.description || '', owner_id: project.owner_id || '', status: project.status || 'active', start_date: project.start_date ? project.start_date.split('T')[0] : '', end_date: project.end_date ? project.end_date.split('T')[0] : '' });
      fetchExistingAttachments(project.id);
    }
  }, [project]);

  const fetchExistingAttachments = async (projectId) => { try { const attachments = await attachmentService.getProjectAttachments(projectId); setExistingAttachments(attachments); } catch (error) { console.error('Error fetching attachments:', error); } };
  const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleFileSelect = (e) => { const files = Array.from(e.target.files); const validFiles = files.filter(file => { if (file.size > 10 * 1024 * 1024) { alert(`${file.name} is too large (max 10MB)`); return false; } return true; }); setSelectedFiles(prev => [...prev, ...validFiles]); };
  const removeFile = (index) => { setSelectedFiles(prev => prev.filter((_, i) => i !== index)); };
  const removeExistingAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try { const token = localStorage.getItem('token'); const response = await fetch(`http://localhost:5000/api/attachments/project/${attachmentId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) throw new Error('Delete failed'); setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId)); }
      catch (error) { console.error('Error deleting attachment:', error); alert('Failed to delete attachment'); }
    }
  };
  const handleSubmit = (e) => { e.preventDefault(); if (!formData.name.trim()) { alert('Project name is required'); return; } if (!formData.owner_id) { alert('Please select a project owner'); return; } onSubmit({ ...formData, owner_id: Number(formData.owner_id), files: selectedFiles }); };

  const getFileIcon = (fileName) => { const ext = fileName.split('.').pop().toLowerCase(); return { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', txt: '📋', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', zip: '📦' }[ext] || '📎'; };
  const formatFileSize = (bytes) => { if (bytes === 0) return '0 Bytes'; const k = 1024; const sizes = ['Bytes', 'KB', 'MB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]; };

  const inputClass = "py-2.5 px-3 border border-gray-400 rounded text-sm font-inherit transition-all focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(52,152,219,0.1)]";

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <div className="py-5 border-b border-gray-200">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="font-bold text-slate-800 text-sm">Project Name *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter project name" required className={inputClass} />
        </div>
      </div>

      <div className="py-5 border-b border-gray-200">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="font-bold text-slate-800 text-sm">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Enter project description" rows="4" className={`${inputClass} resize-y min-h-[80px]`} />
        </div>
      </div>

      <div className="py-5 border-b border-gray-200">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Project Details</div>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="owner_id" className="font-bold text-slate-800 text-sm">Project Owner *</label>
            <select id="owner_id" name="owner_id" value={formData.owner_id} onChange={handleChange} required className={inputClass}><option value="">Select owner</option>{users.map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="font-bold text-slate-800 text-sm">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputClass}><option value="active">Active</option><option value="in_progress">In Progress</option><option value="planning">Planning</option></select>
          </div>
        </div>
      </div>

      <div className="py-5 border-b border-gray-200">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Timeline</div>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div className="flex flex-col gap-1.5"><label htmlFor="start_date" className="font-bold text-slate-800 text-sm">Start Date</label><input type="date" id="start_date" name="start_date" value={formData.start_date} onChange={handleChange} className={inputClass} /></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="end_date" className="font-bold text-slate-800 text-sm">End Date</label><input type="date" id="end_date" name="end_date" value={formData.end_date} onChange={handleChange} className={inputClass} /></div>
        </div>
      </div>

      <div className="py-5">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Attachments</div>

        {existingAttachments.length > 0 && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h4 className="m-0 mb-2.5 text-[13px] text-slate-800 font-semibold">Current Attachments ({existingAttachments.length})</h4>
            <div className="flex flex-col gap-2">
              {existingAttachments.map(attachment => (
                <div key={attachment.id} className="flex items-center gap-2.5 p-2.5 bg-blue-50 border border-blue-200 rounded">
                  <span className="text-xl min-w-[24px] text-center">{getFileIcon(attachment.file_name)}</span>
                  <div className="flex-1 min-w-0"><div className="text-[13px] font-medium text-slate-800 break-words">{attachment.file_name}</div><div className="text-[11px] text-gray-500 mt-0.5">{formatFileSize(attachment.file_size)}</div></div>
                  <button type="button" className="w-7 h-7 border-none bg-gray-200 text-red-500 rounded cursor-pointer text-base transition-all shrink-0 hover:bg-red-500 hover:text-white" onClick={() => removeExistingAttachment(attachment.id)} title="Delete attachment">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-5 bg-white border-2 border-dashed border-blue-500 rounded-md text-center cursor-pointer transition-all hover:bg-gray-100 hover:border-blue-600 max-md:p-4 max-sm:p-3">
          <input type="file" id="file-input" multiple onChange={handleFileSelect} disabled={uploading} style={{ display: 'none' }} />
          <label htmlFor="file-input" className="block cursor-pointer font-medium text-blue-500 mb-2">{uploading ? 'Uploading...' : '+ Click to select files or drag & drop'}</label>
          <p className="m-0 text-xs text-gray-500">Max 10MB per file. Supported: PDF, Word, Excel, Images, ZIP</p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="m-0 mb-2.5 text-[13px] text-slate-800 font-semibold">New Files ({selectedFiles.length})</h4>
            <div className="flex flex-col gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2.5 p-2.5 bg-white border border-gray-200 rounded">
                  <span className="text-xl min-w-[24px] text-center">{getFileIcon(file.name)}</span>
                  <div className="flex-1 min-w-0"><div className="text-[13px] font-medium text-slate-800 break-words">{file.name}</div><div className="text-[11px] text-gray-500 mt-0.5">{formatFileSize(file.size)}</div></div>
                  <button type="button" className="w-7 h-7 border-none bg-gray-200 text-red-500 rounded cursor-pointer text-base transition-all shrink-0 hover:bg-red-500 hover:text-white" onClick={() => removeFile(index)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 mt-2.5">
        <button type="submit" className="flex-1 p-3 bg-blue-500 text-white border-none rounded text-sm font-bold cursor-pointer transition-colors hover:enabled:bg-blue-600 active:enabled:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={uploading}>{project ? 'Update Project' : 'Create Project'}</button>
        <button type="button" className="flex-1 p-3 bg-gray-200 text-slate-800 border-none rounded text-sm font-bold cursor-pointer transition-colors hover:enabled:bg-gray-300 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60" onClick={onCancel} disabled={uploading}>Cancel</button>
      </div>
    </form>
  );
};

export default ProjectForm;
