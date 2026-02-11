import { useState, useEffect } from 'react';
import { attachmentService } from '../../services/api';
import { handleAPIError, showError, showSuccess } from '../../utils/errorHandler';
import '../../styles/TaskAttachments.css';

const TaskAttachments = ({ taskId, canEdit, onAttachmentChange }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const data = await attachmentService.getByTask(taskId);
      setAttachments(data);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load attachments');
      showError(message);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showError('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      await attachmentService.upload(taskId, file);
      showSuccess('File uploaded successfully');
      fetchAttachments();
      if (onAttachmentChange) {
        onAttachmentChange();
      }
      e.target.value = ''; // Reset input
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to upload file');
      showError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (attachmentId) => {
    attachmentService.download(attachmentId);
  };

  const handleDelete = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await attachmentService.delete(attachmentId);
        setAttachments(attachments.filter(a => a.id !== attachmentId));
        showSuccess('Attachment deleted successfully');
        if (onAttachmentChange) {
          onAttachmentChange();
        }
      } catch (error) {
        const { message } = handleAPIError(error, 'Failed to delete attachment');
        showError(message);
      }
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

  if (loading) return <div className="loading-small">Loading attachments...</div>;

  return (
    <div className="task-attachments">
      <div className="attachments-header">
        <h4>📎 Attachments</h4>
        {canEdit && (
          <label className="upload-btn">
            {uploading ? 'Uploading...' : '+ Add File'}
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      {attachments.length > 0 ? (
        <div className="attachments-list">
          {attachments.map(attachment => (
            <div key={attachment.id} className="attachment-item">
              <div className="attachment-icon">
                {getFileIcon(attachment.file_name)}
              </div>
              <div className="attachment-info">
                <div className="attachment-name">{attachment.file_name}</div>
                <div className="attachment-meta">
                  {formatFileSize(attachment.file_size)} • {attachment.uploaded_by_name}
                </div>
              </div>
              <div className="attachment-actions">
                <button
                  className="action-download"
                  title="Download"
                  onClick={() => handleDownload(attachment.id)}
                >
                  ⬇️
                </button>
                {canEdit && (
                  <button
                    className="action-delete"
                    title="Delete"
                    onClick={() => handleDelete(attachment.id)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-attachments">
          <p>No attachments yet</p>
          {canEdit && <p className="hint">Click "Add File" to upload documents</p>}
        </div>
      )}
    </div>
  );
};

export default TaskAttachments;
