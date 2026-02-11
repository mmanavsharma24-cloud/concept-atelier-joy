import { useState, useEffect } from 'react';
import { attachmentService } from '../../services/api';
import { handleAPIError, showError, showSuccess } from '../../utils/errorHandler';

const TaskAttachments = ({ taskId, canEdit, onAttachmentChange }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchAttachments(); }, [taskId]);

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
    if (file.size > 10 * 1024 * 1024) { showError('File size must be less than 10MB'); return; }
    try {
      setUploading(true);
      await attachmentService.upload(taskId, file);
      showSuccess('File uploaded successfully');
      fetchAttachments();
      if (onAttachmentChange) onAttachmentChange();
      e.target.value = '';
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to upload file');
      showError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (attachmentId) => { attachmentService.download(attachmentId); };

  const handleDelete = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await attachmentService.delete(attachmentId);
        setAttachments(attachments.filter(a => a.id !== attachmentId));
        showSuccess('Attachment deleted successfully');
        if (onAttachmentChange) onAttachmentChange();
      } catch (error) {
        const { message } = handleAPIError(error, 'Failed to delete attachment');
        showError(message);
      }
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

  if (loading) return <div className="text-center py-3 text-gray-500 text-[13px]">Loading attachments...</div>;

  return (
    <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex justify-between items-center mb-4 max-md:flex-col max-md:items-start max-md:gap-2.5">
        <h4 className="m-0 text-[15px] font-semibold text-slate-800">📎 Attachments</h4>
        {canEdit && (
          <label className="px-3 py-1.5 bg-blue-500 text-white border-none rounded cursor-pointer text-xs font-medium transition-all duration-300 hover:bg-blue-600 hover:-translate-y-px disabled:bg-gray-400 disabled:cursor-not-allowed max-md:w-full max-md:text-center">
            {uploading ? 'Uploading...' : '+ Add File'}
            <input type="file" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>
        )}
      </div>

      {attachments.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {attachments.map(attachment => (
            <div key={attachment.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-md transition-all duration-300 hover:shadow-md hover:border-gray-300 max-md:flex-wrap">
              <div className="text-2xl min-w-[32px] text-center">{getFileIcon(attachment.file_name)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 break-words mb-1">{attachment.file_name}</div>
                <div className="text-xs text-gray-500">{formatFileSize(attachment.file_size)} • {attachment.uploaded_by_name}</div>
              </div>
              <div className="flex gap-2 shrink-0 max-md:w-full max-md:justify-end">
                <button
                  title="Download"
                  onClick={() => handleDownload(attachment.id)}
                  className="w-8 h-8 border border-gray-100 bg-white rounded cursor-pointer text-base transition-all duration-300 flex items-center justify-center hover:bg-green-100 hover:border-green-500"
                >
                  ⬇️
                </button>
                {canEdit && (
                  <button
                    title="Delete"
                    onClick={() => handleDelete(attachment.id)}
                    className="w-8 h-8 border border-gray-100 bg-white rounded cursor-pointer text-base transition-all duration-300 flex items-center justify-center hover:bg-red-100 hover:border-red-500"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 text-gray-500">
          <p className="m-0 text-sm">No attachments yet</p>
          {canEdit && <p className="text-xs text-gray-400 mt-1.5">Click "Add File" to upload documents</p>}
        </div>
      )}
    </div>
  );
};

export default TaskAttachments;
