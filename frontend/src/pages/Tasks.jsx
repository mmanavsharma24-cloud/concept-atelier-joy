import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { taskService, projectService, userService, attachmentService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import KanbanBoard from '../components/kanban/KanbanBoard';
import PermissionGuard from '../components/common/PermissionGuard';
import Modal from '../components/modals/Modal';
import TaskForm from '../components/modals/TaskForm';
import { handleAPIError, showError, showSuccess } from '../utils/errorHandler';

const statusBadgeColors = { pending: 'bg-yellow-100 text-yellow-800', in_progress: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800' };
const priorityBadgeColors = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-red-100 text-red-800', critical: 'bg-red-200 text-red-800' };
const focusStatusBadgeColors = { pending: 'bg-yellow-100 text-yellow-800', in_progress: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800' };

const Tasks = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDueDate, setFilterDueDate] = useState('all');
  const [searchTitle, setSearchTitle] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [selectedKanbanProject, setSelectedKanbanProject] = useState(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => { fetchData(); }, [location]);
  useEffect(() => { const handleFocus = () => { fetchData(); }; window.addEventListener('focus', handleFocus); return () => window.removeEventListener('focus', handleFocus); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      let tasksData, projectsData;
      if (user?.role === 'user') { tasksData = await taskService.getUserAnalytics(); projectsData = await projectService.getUserAnalytics(); }
      else { tasksData = await taskService.getAll(); projectsData = await projectService.getAll(); }
      const usersData = await userService.getAll();
      setTasks(tasksData); setUsers(usersData); setProjects(projectsData);
      if (projectsData.length > 0) setSelectedKanbanProject(projectsData[0].id);
      setLoading(false);
    } catch (error) { const { message } = handleAPIError(error, 'Failed to load tasks'); showError(message); setLoading(false); }
  };

  const getFilteredTasks = () => {
    let filtered = tasks;
    if (filterStatus !== 'all') filtered = filtered.filter(t => t.status === filterStatus);
    if (user?.role !== 'user' && filterAssignee !== 'all') filtered = filtered.filter(t => t.assigned_to === Number(filterAssignee));
    if (filterPriority !== 'all') filtered = filtered.filter(t => t.priority === filterPriority);
    if (filterDueDate !== 'all') {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(t => {
        if (!t.due_date) return filterDueDate === 'no-date';
        const dueDate = new Date(t.due_date); dueDate.setHours(0, 0, 0, 0);
        switch (filterDueDate) {
          case 'overdue': return dueDate < today;
          case 'today': return dueDate.getTime() === today.getTime();
          case 'this-week': const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7); return dueDate >= today && dueDate <= weekEnd;
          case 'this-month': return dueDate.getMonth() === today.getMonth() && dueDate.getFullYear() === today.getFullYear();
          case 'no-date': return !t.due_date;
          default: return true;
        }
      });
    }
    if (searchTitle.trim()) filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTitle.toLowerCase()));
    return filtered;
  };

  const handleCreateTask = () => { setShowCreateModal(true); };
  const handleEditTask = (task) => { setEditingTask(task); setShowEditModal(true); };
  const handleCreateSubmit = async (formData) => { try { const files = formData.files || []; const { files: _, ...taskData } = formData; const newTask = await projectService.createTask(taskData); if (files.length > 0) { for (const file of files) { try { await attachmentService.upload(newTask.id, file); } catch (error) { console.error('Error uploading file:', error); showError(`Failed to upload ${file.name}`); } } } showSuccess('Task created successfully'); setShowCreateModal(false); fetchData(); } catch (error) { const { message } = handleAPIError(error, 'Failed to create task'); showError(message); } };
  const handleEditSubmit = async (formData) => { try { const files = formData.files || []; const { files: _, ...taskData } = formData; await taskService.update(editingTask.id, taskData); if (files.length > 0) { for (const file of files) { try { await attachmentService.upload(editingTask.id, file); } catch (error) { console.error('Error uploading file:', error); showError(`Failed to upload ${file.name}`); } } } showSuccess('Task updated successfully'); setShowEditModal(false); setEditingTask(null); fetchData(); } catch (error) { const { message } = handleAPIError(error, 'Failed to update task'); showError(message); } };
  const handleTaskRowClick = (task) => { navigate(`/tasks/${task.id}`); };

  if (loading) return <div className="flex justify-center items-center h-screen text-lg text-gray-500">Loading tasks...</div>;

  const filteredTasks = getFilteredTasks();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-300 min-h-screen max-md:p-5">
        <div className="flex justify-between items-center mb-8 bg-gradient-to-br from-indigo-500 to-purple-700 py-6 px-8 rounded-xl shadow-[0_8px_32px_rgba(102,126,234,0.2)] max-md:flex-col max-md:items-start max-md:gap-4">
          <h1 className="m-0 text-3xl text-white max-md:text-2xl">Tasks</h1>
          <div className="flex gap-4 items-center">
            <div className="flex gap-1 bg-white p-1 rounded shadow">
              <button className={`py-2 px-4 border-none rounded text-[13px] font-bold cursor-pointer transition-all ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-slate-800 hover:bg-gray-300'}`} onClick={() => setViewMode('table')}>📋 Table</button>
              <button className={`py-2 px-4 border-none rounded text-[13px] font-bold cursor-pointer transition-all ${viewMode === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-slate-800 hover:bg-gray-300'}`} onClick={() => setViewMode('kanban')}>📊 Kanban</button>
            </div>
            <PermissionGuard resource="tasks" action="create">
              <button className="py-2.5 px-5 bg-blue-500 text-white border-none rounded text-sm font-bold cursor-pointer transition-colors hover:bg-blue-600 max-md:w-full" onClick={handleCreateTask}>+ New Task</button>
            </PermissionGuard>
            <button className="py-2 px-4 bg-gray-200 text-slate-800 border-none rounded text-[13px] font-bold cursor-pointer transition-all hover:bg-gray-300" onClick={() => setIsFocusMode(true)} title="Enter Focus Mode">🎯 Focus</button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <>
            <div className="mb-5">
              <input type="text" className="w-full py-3 px-4 border-2 border-gray-200 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(52,152,219,0.1)] max-md:text-[13px]" placeholder="🔍 Search tasks by title..." value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} />
            </div>

            <div className="flex gap-4 mb-5 flex-wrap items-center bg-white p-4 rounded-lg shadow max-md:flex-col max-md:gap-2.5">
              {[
                { label: 'Status', value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), options: [{ value: 'all', label: `All (${tasks.length})` }, { value: 'pending', label: `To Do (${tasks.filter(t => t.status === 'pending').length})` }, { value: 'in_progress', label: `In Progress (${tasks.filter(t => t.status === 'in_progress').length})` }, { value: 'completed', label: `Done (${tasks.filter(t => t.status === 'completed').length})` }] },
                ...(user?.role !== 'user' ? [{ label: 'Assignee', value: filterAssignee, onChange: (e) => setFilterAssignee(e.target.value), options: [{ value: 'all', label: 'All' }, ...users.map(u => ({ value: u.id, label: u.full_name }))] }] : []),
                { label: 'Priority', value: filterPriority, onChange: (e) => setFilterPriority(e.target.value), options: [{ value: 'all', label: 'All' }, { value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }] },
                { label: 'Due Date', value: filterDueDate, onChange: (e) => setFilterDueDate(e.target.value), options: [{ value: 'all', label: 'All' }, { value: 'overdue', label: 'Overdue' }, { value: 'today', label: 'Today' }, { value: 'this-week', label: 'This Week' }, { value: 'this-month', label: 'This Month' }, { value: 'no-date', label: 'No Due Date' }] },
              ].map((filter, i) => (
                <div key={i} className="flex items-center gap-2 max-md:w-full">
                  <label className="font-bold text-slate-800 text-[13px] whitespace-nowrap">{filter.label}:</label>
                  <select value={filter.value} onChange={filter.onChange} className="py-2 px-3 border border-gray-400 rounded text-[13px] cursor-pointer bg-white transition-colors focus:outline-none focus:border-blue-500 max-md:w-full">{filter.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
                </div>
              ))}
              <button className="py-2 px-4 bg-gray-200 text-slate-800 border-none rounded text-[13px] font-bold cursor-pointer transition-colors whitespace-nowrap hover:bg-gray-300 max-md:w-full" onClick={() => { setFilterStatus('all'); setFilterAssignee('all'); setFilterPriority('all'); setFilterDueDate('all'); setSearchTitle(''); }}>Reset Filters</button>
            </div>

            <div className="text-[13px] text-gray-500 mb-4 font-bold">Showing {filteredTasks.length} of {tasks.length} tasks</div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 mt-5 max-md:grid-cols-1 max-md:gap-4">
              {filteredTasks.length > 0 ? filteredTasks.map(task => (
                <div key={task.id} className="bg-white/95 rounded-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] cursor-pointer transition-all border-l-4 border-l-indigo-500 backdrop-blur-[10px] flex flex-col gap-4 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(102,126,234,0.2)] hover:border-l-purple-700 max-md:p-4" onClick={() => handleTaskRowClick(task)}>
                  <div className="flex justify-between items-start gap-3">
                    <div className="text-base font-bold text-slate-800 leading-snug flex-1 break-words max-md:text-[15px]">{task.title}</div>
                    <span className={`inline-block py-1.5 px-3 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0 ${statusBadgeColors[task.status] || ''}`}>
                      {task.status === 'pending' && '⏳ To Do'}{task.status === 'in_progress' && '⚙️ In Progress'}{task.status === 'completed' && '✓ Done'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center gap-3 text-[13px] max-md:text-xs"><span className="font-semibold text-gray-500 min-w-[100px]">👤 Assigned To:</span><span className="text-slate-800 font-medium text-right flex-1">{task.assigned_to_name || 'Unassigned'}</span></div>
                    <div className="flex justify-between items-center gap-3 text-[13px] max-md:text-xs"><span className="font-semibold text-gray-500 min-w-[100px]">📅 Due Date:</span><span className="text-slate-800 font-medium text-right flex-1">{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</span></div>
                    <div className="flex justify-between items-center gap-3 text-[13px] max-md:text-xs"><span className="font-semibold text-gray-500 min-w-[100px]">🎯 Priority:</span><span className={`inline-block py-1 px-2.5 rounded-md text-[11px] font-bold capitalize whitespace-nowrap ${priorityBadgeColors[task.priority] || ''}`}>{task.priority}</span></div>
                    {task.subtask_total > 0 && <div className="flex justify-between items-center gap-3 text-[13px]"><span className="font-semibold text-gray-500 min-w-[100px]">✓ Subtasks:</span><span className="text-slate-800 font-medium text-right flex-1">{task.subtask_completed}/{task.subtask_total}</span></div>}
                  </div>
                  {task.subtask_total > 0 && (
                    <div className="mt-2.5 pt-4 border-t border-gray-200">
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-700 transition-[width] duration-700" style={{ width: `${(task.subtask_completed / task.subtask_total) * 100}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 px-5 text-center text-gray-500">
                  <div className="text-6xl mb-4 opacity-50">📭</div>
                  <p className="text-base font-medium">No tasks found</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-5 bg-white p-4 rounded-lg shadow">
              <label htmlFor="kanban-project" className="font-bold text-slate-800 whitespace-nowrap">Select Project:</label>
              <select id="kanban-project" value={selectedKanbanProject || ''} onChange={(e) => setSelectedKanbanProject(Number(e.target.value))} className="py-2 px-3 border border-gray-400 rounded text-sm cursor-pointer min-w-[200px] focus:outline-none focus:border-blue-500">{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
            </div>
            {selectedKanbanProject && <KanbanBoard projectId={selectedKanbanProject} users={users} />}
          </>
        )}

        {/* Focus Mode */}
        {isFocusMode && (
          <div className="fixed inset-0 bg-white z-[9999] flex flex-col overflow-hidden animate-[slideInFocusMode_0.4s_ease-in-out]">
            <div className="bg-slate-800 border-b-[3px] border-blue-500 py-4 px-8 flex justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.15)] shrink-0 max-md:py-3 max-md:px-4">
              <h2 className="m-0 text-2xl text-white font-bold tracking-wider max-md:text-xl max-sm:text-lg">Focus Mode</h2>
              <button className="bg-transparent text-white border-2 border-white rounded-full w-9 h-9 text-xl font-bold cursor-pointer flex items-center justify-center transition-all hover:bg-white hover:text-slate-800 hover:rotate-90 max-md:w-8 max-md:h-8 max-md:text-lg" onClick={() => setIsFocusMode(false)} title="Exit Focus Mode">✕</button>
            </div>
            <div className="flex-1 flex items-start justify-center py-5 px-8 overflow-y-auto bg-gray-50 max-md:py-4 max-md:px-4 max-sm:py-2.5 max-sm:px-3">
              <div className="w-full grid grid-cols-2 gap-5 max-lg:grid-cols-1">
                {/* Tasks */}
                <div className="flex flex-col gap-4">
                  <h3 className="m-0 text-sm font-bold text-slate-800 uppercase tracking-wider">Tasks</h3>
                  <div className="w-full bg-white rounded-md shadow overflow-hidden mt-2.5">
                    <table className="w-full border-collapse table-fixed">
                      <thead className="bg-gray-200 border-b-2 border-gray-400 sticky top-0">
                        <tr>{['Task Name', 'Assigned To', 'Due Date', 'Status', 'Subtasks'].map((h, i) => <th key={i} className="py-3 px-2.5 text-left text-[10px] font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-md:py-2.5 max-md:text-[11px]" style={{ width: ['40%', '18%', '18%', '12%', '12%'][i] }}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {tasks.length > 0 ? tasks.map(task => (
                          <tr key={task.id} className="border-b border-gray-200 transition-all hover:bg-blue-50">
                            {[task.title, task.assigned_to_name || 'Unassigned', task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'].map((val, i) => <td key={i} className="py-3 px-2.5 text-xs text-slate-800 align-middle overflow-hidden text-ellipsis max-md:py-2.5 max-md:text-[11px]">{val}</td>)}
                            <td className="py-3 px-2.5 text-xs align-middle"><span className={`inline-block py-1.5 px-2.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${focusStatusBadgeColors[task.status] || ''}`}>{task.status === 'pending' && 'PD'}{task.status === 'in_progress' && 'IP'}{task.status === 'completed' && 'Done'}</span></td>
                            <td className="py-3 px-2.5 text-xs text-center align-middle">{task.subtask_total > 0 ? <span className="inline-block py-1.5 px-3 bg-blue-100 text-blue-700 rounded-full text-xs font-bold whitespace-nowrap">{task.subtask_completed}/{task.subtask_total}</span> : <span className="text-gray-400 text-xs font-semibold">-</span>}</td>
                          </tr>
                        )) : <tr><td colSpan="5" className="text-center py-10 px-4 text-gray-400 text-base">No tasks found</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Projects */}
                <div className="flex flex-col gap-4">
                  <h3 className="m-0 text-sm font-bold text-slate-800 uppercase tracking-wider">Projects</h3>
                  <div className="w-full bg-white rounded-md shadow overflow-hidden mt-2.5">
                    <table className="w-full border-collapse table-fixed">
                      <thead className="bg-gray-200 border-b-2 border-gray-400 sticky top-0">
                        <tr>{['Project Name', 'Lead', 'End Date'].map((h, i) => <th key={i} className="py-3 px-2.5 text-left text-[10px] font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap max-md:py-2.5 max-md:text-[11px]" style={{ width: ['50%', '25%', '25%'][i] }}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {projects.length > 0 ? projects.map(project => (
                          <tr key={project.id} className="border-b border-gray-200 transition-all hover:bg-blue-50">
                            <td className="py-3 px-2.5 text-xs text-slate-800 align-middle">{project.name}</td>
                            <td className="py-3 px-2.5 text-xs text-slate-800 align-middle">{project.owner_name || '-'}</td>
                            <td className="py-3 px-2.5 text-xs text-slate-800 align-middle">{project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}</td>
                          </tr>
                        )) : <tr><td colSpan="3" className="text-center py-10 px-4 text-gray-400 text-base">No projects found</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Task Modal */}
        <Modal isOpen={showCreateModal} title="Create New Task" onClose={() => setShowCreateModal(false)} size="large">
          <div className="p-6"><TaskForm users={users} projects={projects} onSubmit={handleCreateSubmit} onCancel={() => setShowCreateModal(false)} /></div>
        </Modal>

        {/* Edit Task Modal */}
        <Modal isOpen={showEditModal} title="Edit Task" onClose={() => { setShowEditModal(false); setEditingTask(null); }} size="large">
          <div className="p-6">{editingTask && <TaskForm task={editingTask} users={users} projects={projects} onSubmit={handleEditSubmit} onCancel={() => { setShowEditModal(false); setEditingTask(null); }} />}</div>
        </Modal>
      </div>
    </DndProvider>
  );
};

export default Tasks;
