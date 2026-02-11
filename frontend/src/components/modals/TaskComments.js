import { useState, useEffect } from 'react';
import { commentService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { handleAPIError, showError, showSuccess } from '../../utils/errorHandler';
import TaskAttachments from './TaskAttachments';
import '../../styles/TaskComments.css';

const TaskComments = ({ taskId, canEdit, onAttachmentChange }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('comments');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    fetchData();
  }, [taskId]);

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
    if (!newComment.trim()) {
      showError('Comment cannot be empty');
      return;
    }

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
    if (!editingText.trim()) {
      showError('Comment cannot be empty');
      return;
    }

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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="task-comments-section">
      <div className="comments-tabs">
        <button
          className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          💬 Comments ({comments.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'attachments' ? 'active' : ''}`}
          onClick={() => setActiveTab('attachments')}
        >
          📎 Attachments
        </button>
      </div>

      {activeTab === 'comments' && (
        <div className="comments-container">
          <div className="add-comment">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
              rows="3"
            />
            <button
              onClick={handleAddComment}
              className="add-comment-btn"
              disabled={!newComment.trim()}
            >
              Post Comment
            </button>
          </div>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-author">
                      <span className="author-avatar">
                        {comment.full_name.charAt(0).toUpperCase()}
                      </span>
                      <div className="author-info">
                        <p className="author-name">{comment.full_name}</p>
                        <p className="comment-time">
                          {new Date(comment.created_at).toLocaleDateString()} at{' '}
                          {new Date(comment.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {user?.id === comment.user_id && (
                      <div className="comment-actions">
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditingText(comment.content);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div className="edit-comment">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="comment-input"
                        rows="3"
                      />
                      <div className="edit-actions">
                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          className="save-btn"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingText('');
                          }}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="comment-content">{comment.content}</p>
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
