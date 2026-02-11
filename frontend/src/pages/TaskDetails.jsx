import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../services/api';
import { usePermission } from '../hooks/usePermission';
import TaskComments from '../components/modals/TaskComments';
import Subtasks from '../components/modals/Subtasks';
import { handleAPIError, showError, showSuccess } from '../utils/errorHandler';

const statusColors = { pending: 'bg-yellow-100 text-yellow-800', in_progress: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800' };
const priorityColors = { high: 'bg-red-100 text-red-700', medium: 'bg-orange-100 text-orange-700', low: 'bg-green-100 text-green-800' };

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermission();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTaskDetails(); }, [id]);

  const fetchTaskDetails = async () => {
    try { setLoading(true); const taskData = await taskService.getById(id); setTask(taskData); setLoading(false); }
    catch (error) { const { message } = handleAPIError(error, 'Failed to load task'); showError(message); setLoading(false); }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try { await taskService.delete(id); showSuccess('Task deleted successfully'); navigate('/tasks'); }
      catch (error) { const { message } = handleAPIError(error, 'Failed to delete task'); showError(message); }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-lg text-gray-500">Loading task...</div>;
  if (!task) return <div className="flex justify-center items-center h-screen text-lg text-gray-500">Task not found</div>;

  const statusLabel = task.status === 'pending' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Done';

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white border-b border-gray-200 py-4 px-8 flex items-center shadow-sm max-md:py-3 max-md:px-4">
        <button className="flex items-center gap-2 py-2 px-4 bg-blue-500 text-white border-none rounded text-sm font-semibold cursor-pointer transition-all hover:bg-blue-600 hover:-translate-x-0.5" onClick={() => navigate('/tasks')}>← Back to Tasks</button>
      </div>

      <div className="flex-1 flex items-start justify-center py-8 px-5 w-full max-md:py-5 max-md:px-2.5">
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-10 w-full max-w-full max-md:p-6 max-sm:p-4">
          {/* Task Info Section */}
          <div className="mb-10 pb-10 border-b border-gray-200 max-sm:mb-5 max-sm:pb-5">
            <div className="flex justify-between items-center mb-5 gap-5 max-md:flex-col max-md:items-start">
              <h1 className="m-0 text-3xl text-slate-800 font-bold max-md:text-2xl max-sm:text-xl">{task.title}</h1>
              <span className={`inline-block py-1.5 px-3 rounded text-xs font-bold uppercase whitespace-nowrap ${statusColors[task.status] || ''}`}>{statusLabel}</span>
            </div>
            <p className="m-0 mb-5 text-base text-gray-500 leading-relaxed">{task.description || 'No description'}</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-8 max-md:grid-cols-1">
              <div className="flex flex-col gap-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</label><span className={`inline-block self-start py-1.5 px-3 rounded text-xs font-bold uppercase ${statusColors[task.status] || ''}`}>{statusLabel}</span></div>
              <div className="flex flex-col gap-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Priority</label><span className={`inline-block self-start py-1.5 px-3 rounded text-xs font-bold capitalize ${priorityColors[task.priority] || ''}`}>{task.priority}</span></div>
              {task.due_date && <div className="flex flex-col gap-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</label><span className="text-[15px] text-slate-800 font-medium">{new Date(task.due_date).toLocaleDateString()}</span></div>}
              <div className="flex flex-col gap-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned To</label><span className="text-[15px] text-slate-800 font-medium">{task.assigned_to_name || 'Unassigned'}</span></div>
            </div>
            <div className="flex gap-3 max-md:flex-col">
              <button className="py-2.5 px-5 bg-blue-500 text-white border-none rounded text-sm font-semibold cursor-pointer transition-all hover:bg-blue-600 max-md:w-full" onClick={() => window.open(`/tasks/${id}/edit`, '_blank')}>Edit Task</button>
              <button className="py-2.5 px-5 bg-red-500 text-white border-none rounded text-sm font-semibold cursor-pointer transition-all hover:bg-red-600 max-md:w-full" onClick={handleDelete}>Delete Task</button>
            </div>
          </div>

          {/* Subtasks */}
          <Subtasks taskId={id} onSubtaskChange={fetchTaskDetails} />

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-10 max-lg:grid-cols-1 max-lg:gap-8">
            <div className="flex flex-col gap-5">
              <h2 className="m-0 text-xl text-slate-800 font-bold">Task Information</h2>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Status', content: <span className={`inline-block py-1.5 px-3 rounded text-xs font-bold uppercase ${statusColors[task.status] || ''}`}>{statusLabel}</span> },
                  { label: 'Priority', content: <span className={`inline-block py-1.5 px-3 rounded text-xs font-bold capitalize ${priorityColors[task.priority] || ''}`}>{task.priority}</span> },
                  { label: 'Assigned To', content: <span>{task.assigned_to_name || 'Unassigned'}</span> },
                  ...(task.due_date ? [{ label: 'Due Date', content: <span>{new Date(task.due_date).toLocaleDateString()}</span> }] : []),
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2 p-3 bg-gray-50 rounded max-sm:p-2.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</label>
                    <span className="text-sm text-slate-800 font-medium">{item.content}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <TaskComments taskId={id} canEdit={can('tasks', 'update')} onAttachmentChange={fetchTaskDetails} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
