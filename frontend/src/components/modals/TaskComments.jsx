import { useState, useEffect } from 'react';
import { commentService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { handleAPIError, showError, showSuccess } from '../../utils/errorHandler';
import TaskAttachments from './TaskAttachments';

const TaskComments = ({ taskId, canEdit, onAttachmentChange }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('comments');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => { fetchData(); }, [taskId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const commentsData = await commentService.getByTask(taskId);
      setComments(commentsData);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load comments');
      showError(message);
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) { showError('Comment cannot be empty'); return; }
    try {
      await commentService.add(taskId, { content: newComment });
      setNewComment('');
      showSuccess('Comment added successfully');
      fetchData();
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to add comment');
      showError(message);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingText.trim()) { showError('Comment cannot be empty'); return; }
    try {
      await commentService.update(commentId, { content: editingText });
      setEditingId(null);
      setEditingText('');
      showSuccess('Comment updated successfully');
      fetchData();
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to update comment');
      showError(message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentService.delete(commentId);
        showSuccess('Comment deleted successfully');
        fetchData();
      } catch (error) {
        const { message } = handleAPIError(error, 'Failed to delete comment');
        showError(message);
      }
    }
  };

  if (loading) return <div className="text-center p-12 text-lg text-gray-500">Loading...</div>;

  return (
    <div className="mt-8 border-t-2 border-gray-100 pt-5">
      {/* Tabs */}
      <div className="flex gap-2.5 mb-5 border-b-2 border-gray-100">
        <button
          className={`px-5 py-3 bg-transparent border-none text-sm font-semibold cursor-pointer border-b-[3px] transition-all duration-300 relative -bottom-0.5 ${
            activeTab === 'comments' ? 'text-blue-500 border-b-blue-500' : 'text-gray-500 border-b-transparent hover:text-blue-500'
          }`}
          onClick={() => setActiveTab('comments')}
        >
          💬 Comments ({comments.length})
        </button>
        <button
          className={`px-5 py-3 bg-transparent border-none text-sm font-semibold cursor-pointer border-b-[3px] transition-all duration-300 relative -bottom-0.5 ${
            activeTab === 'attachments' ? 'text-blue-500 border-b-blue-500' : 'text-gray-500 border-b-transparent hover:text-blue-500'
          }`}
          onClick={() => setActiveTab('attachments')}
        >
          📎 Attachments
        </button>
      </div>

      {activeTab === 'comments' && (
        <div className="flex flex-col gap-5">
          {/* Add Comment */}
          <div className="flex flex-col gap-2.5 p-4 bg-blue-50/50 rounded-xl border border-gray-100">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="p-3 border border-gray-300 rounded-lg text-sm font-inherit resize-y transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10"
              rows="3"
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="self-end px-5 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none rounded-md font-semibold cursor-pointer transition-all duration-300 hover:enabled:-translate-y-0.5 hover:enabled:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post Comment
            </button>
          </div>

          {/* Comments List */}
          <div className="flex flex-col gap-4">
            {comments.length === 0 ? (
              <p className="text-center text-gray-400 py-8 italic">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="p-4 bg-blue-50/50 rounded-xl border-l-4 border-l-blue-500 transition-all duration-300 hover:shadow-md">
                  <div className="flex justify-between items-start mb-3 max-md:flex-col max-md:gap-2.5">
                    <div className="flex gap-2.5 items-start">
                      <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {comment.full_name.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <p className="m-0 font-bold text-slate-800 text-sm">{comment.full_name}</p>
                        <p className="m-0 text-xs text-gray-400">
                          {new Date(comment.created_at).toLocaleDateString()} at{' '}
                          {new Date(comment.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {user?.id === comment.user_id && (
                      <div className="flex gap-2 max-md:w-full max-md:justify-start">
                        <button
                          className="px-3 py-1.5 bg-transparent border border-blue-500 text-blue-500 rounded text-xs font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-100"
                          onClick={() => { setEditingId(comment.id); setEditingText(comment.content); }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1.5 bg-transparent border border-red-500 text-red-500 rounded text-xs font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-100"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div className="flex flex-col gap-2.5 mt-2.5">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg text-sm font-inherit resize-y transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10"
                        rows="3"
                      />
                      <div className="flex gap-2.5 justify-end max-md:justify-start">
                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          className="px-4 py-2 bg-gradient-to-br from-green-500 to-green-600 text-white border-none rounded-md font-semibold cursor-pointer transition-all duration-300 text-[13px] hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditingText(''); }}
                          className="px-4 py-2 bg-gray-100 text-slate-800 border-none rounded-md font-semibold cursor-pointer transition-all duration-300 text-[13px] hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="m-0 text-slate-800 leading-relaxed text-sm">{comment.content}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'attachments' && (
        <TaskAttachments taskId={taskId} canEdit={canEdit} onAttachmentChange={onAttachmentChange} />
      )}
    </div>
  );
};

export default TaskComments;
