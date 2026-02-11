import { useState, useEffect } from 'react';
import { subtaskService } from '../../services/api';
import { handleAPIError, showError, showSuccess } from '../../utils/errorHandler';

const Subtasks = ({ taskId, onSubtaskChange }) => {
  const [subtasks, setSubtasks] = useState([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0, percentage: 0 });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });

  useEffect(() => { fetchSubtasks(); fetchProgress(); }, [taskId]);

  const fetchSubtasks = async () => { try { setLoading(true); const data = await subtaskService.getAll(taskId); setSubtasks(data); } catch (error) { const { message } = handleAPIError(error, 'Failed to load subtasks'); showError(message); } finally { setLoading(false); } };
  const fetchProgress = async () => { try { const data = await subtaskService.getProgress(taskId); setProgress(data); } catch (error) { console.error('Error fetching progress:', error); } };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { showError('Subtask title is required'); return; }
    try { await subtaskService.create(taskId, formData); showSuccess('Subtask created successfully'); setFormData({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' }); setShowForm(false); await fetchSubtasks(); await fetchProgress(); if (onSubtaskChange) onSubtaskChange(); }
    catch (error) { const { message } = handleAPIError(error, 'Failed to create subtask'); showError(message); }
  };

  const handleUpdateSubtask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { showError('Subtask title is required'); return; }
    try { await subtaskService.update(taskId, editingId, formData); showSuccess('Subtask updated successfully'); setFormData({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' }); setEditingId(null); await fetchSubtasks(); await fetchProgress(); if (onSubtaskChange) onSubtaskChange(); }
    catch (error) { const { message } = handleAPIError(error, 'Failed to update subtask'); showError(message); }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    if (!window.confirm('Are you sure you want to delete this subtask?')) return;
    try { await subtaskService.delete(taskId, subtaskId); showSuccess('Subtask deleted successfully'); await fetchSubtasks(); await fetchProgress(); if (onSubtaskChange) onSubtaskChange(); }
    catch (error) { const { message } = handleAPIError(error, 'Failed to delete subtask'); showError(message); }
  };

  const handleStatusChange = async (subtaskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try { await subtaskService.update(taskId, subtaskId, { status: newStatus }); await fetchSubtasks(); await fetchProgress(); if (onSubtaskChange) onSubtaskChange(); }
    catch (error) { const { message } = handleAPIError(error, 'Failed to update subtask status'); showError(message); }
  };

  const handleEditSubtask = (subtask) => {
    setFormData({ title: subtask.title, description: subtask.description || '', priority: subtask.priority || 'medium', due_date: subtask.due_date ? subtask.due_date.split('T')[0] : '', assigned_to: subtask.assigned_to || '' });
    setEditingId(subtask.id); setShowForm(true);
  };

  const handleCancel = () => { setFormData({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' }); setEditingId(null); setShowForm(false); };

  const priorityColors = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-red-100 text-red-700', critical: 'bg-red-200 text-red-800' };
  const inputClass = "py-2.5 px-3 border border-gray-300 rounded text-[13px] font-inherit transition-all focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(52,152,219,0.1)]";

  return (
    <div className="flex flex-col gap-5 p-5 bg-gray-50 rounded-lg mt-5">
      <div className="flex justify-between items-center gap-5 max-md:flex-col max-md:items-start">
        <h3 className="m-0 text-lg font-bold text-slate-800">Subtasks</h3>
        <div className="flex items-center gap-3 flex-1 max-w-[300px] max-md:w-full max-md:max-w-none">
          <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-[width] duration-600" style={{ width: `${progress.percentage}%` }}></div>
          </div>
          <span className="text-xs font-semibold text-gray-500 whitespace-nowrap min-w-[40px]">{progress.completed}/{progress.total}</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-5 text-gray-500 italic">Loading subtasks...</div>
      ) : (
        <>
          {subtasks.length > 0 && (
            <div className="flex flex-col gap-3">
              {subtasks.map(subtask => (
                <div key={subtask.id} className={`flex items-start gap-3 p-3 bg-white border-l-4 rounded transition-all hover:shadow-md hover:translate-x-1 max-md:flex-col ${subtask.status === 'completed' ? 'border-l-green-500 opacity-70' : 'border-l-blue-500'}`}>
                  <div className="flex items-center pt-0.5">
                    <input type="checkbox" checked={subtask.status === 'completed'} onChange={() => handleStatusChange(subtask.id, subtask.status)} className="w-[18px] h-[18px] cursor-pointer accent-blue-500" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className={`text-sm font-semibold text-slate-800 leading-snug ${subtask.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{subtask.title}</div>
                    {subtask.description && <div className="text-xs text-gray-500 leading-snug">{subtask.description}</div>}
                    <div className="flex flex-wrap gap-3 text-[11px]">
                      {subtask.assigned_to_name && <span className="text-gray-500 flex items-center gap-1">👤 {subtask.assigned_to_name}</span>}
                      {subtask.due_date && <span className="text-gray-500 flex items-center gap-1">📅 {new Date(subtask.due_date).toLocaleDateString()}</span>}
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap ${priorityColors[subtask.priority] || ''}`}>{subtask.priority}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 max-md:self-end">
                    <button className="bg-transparent border-none text-base cursor-pointer p-1 px-2 rounded transition-all hover:bg-gray-100" onClick={() => handleEditSubtask(subtask)} title="Edit subtask">✏️</button>
                    <button className="bg-transparent border-none text-base cursor-pointer p-1 px-2 rounded transition-all hover:bg-red-100" onClick={() => handleDeleteSubtask(subtask.id)} title="Delete subtask">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showForm && (
            <button className="py-2.5 px-4 bg-blue-500 text-white border-none rounded text-[13px] font-semibold cursor-pointer transition-colors self-start hover:bg-blue-600" onClick={() => setShowForm(true)}>+ Add Subtask</button>
          )}

          {showForm && (
            <form className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded" onSubmit={editingId ? handleUpdateSubtask : handleAddSubtask}>
              <div className="flex flex-col gap-1.5">
                <input type="text" placeholder="Subtask title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClass} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <textarea placeholder="Description (optional)" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputClass} resize-y min-h-[60px]`} rows="2" />
              </div>
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <div className="flex flex-col gap-1.5">
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClass}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Priority</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-2.5 justify-end max-md:flex-col">
                <button type="submit" className="py-2.5 px-5 bg-green-500 text-white border-none rounded text-[13px] font-semibold cursor-pointer transition-colors hover:bg-green-600 max-md:w-full">{editingId ? 'Update Subtask' : 'Create Subtask'}</button>
                <button type="button" className="py-2.5 px-5 bg-gray-200 text-slate-800 border-none rounded text-[13px] font-semibold cursor-pointer transition-colors hover:bg-gray-300 max-md:w-full" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default Subtasks;
