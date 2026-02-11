import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService, userService, attachmentService } from '../services/api';
import { usePermission } from '../hooks/usePermission';
import ProjectAttachments from '../components/modals/ProjectAttachments';
import { handleAPIError, showError, showSuccess } from '../utils/errorHandler';

const statusColors = { active: 'bg-green-100 text-green-800', in_progress: 'bg-blue-100 text-blue-800', planning: 'bg-cyan-100 text-cyan-800', pending: 'bg-yellow-100 text-yellow-800', completed: 'bg-green-100 text-green-800' };
const metaPriorityColors = { high: 'bg-red-100 text-red-700', medium: 'bg-orange-100 text-orange-700', low: 'bg-green-100 text-green-800' };

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermission();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigned_to: '', priority: 'normal', due_date: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => { fetchProjectDetails(); fetchUsers(); }, [id]);

  const fetchUsers = async () => { try { const usersData = await userService.getAll(); setUsers(usersData); } catch (error) { console.error('Error fetching users:', error); } };
  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const projectData = await projectService.getById(id);
      const tasksData = await projectService.getProjectTasks(id);
      setProject(projectData);
      setTasks(tasksData);
      setLoading(false);
    } catch (error) { const { message } = handleAPIError(error, 'Failed to load project'); showError(message); setLoading(false); }
  };
  const handleDelete = async () => { if (window.confirm('Are you sure you want to delete this project?')) { try { await projectService.delete(id); showSuccess('Project deleted successfully'); navigate('/projects'); } catch (error) { const { message } = handleAPIError(error, 'Failed to delete project'); showError(message); } } };
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      if (!newTask.title.trim()) { showError('Task title is required'); return; }
      const taskData = { title: newTask.title, description: newTask.description, project_id: parseInt(id), assigned_to: newTask.assigned_to ? parseInt(newTask.assigned_to) : null, priority: newTask.priority, due_date: newTask.due_date || null, status: 'pending' };
      const createdTask = await projectService.createTask(taskData);
      if (selectedFiles.length > 0) { for (const file of selectedFiles) { try { await attachmentService.upload(createdTask.id, file); } catch (error) { console.error('Error uploading file:', error); showError(`Failed to upload file: ${file.name}`); } } }
      showSuccess('Task created successfully');
      setNewTask({ title: '', description: '', assigned_to: '', priority: 'normal', due_date: '' });
      setSelectedFiles([]);
      setShowCreateTask(false);
      fetchProjectDetails();
    } catch (error) { const { message } = handleAPIError(error, 'Failed to create task'); showError(message); }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-lg text-gray-500">Loading project...</div>;
  if (!project) return <div className="flex justify-center items-center h-screen text-lg text-gray-500">Project not found</div>;

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white border-b border-gray-200 py-4 px-8 flex items-center shadow-sm max-md:py-3 max-md:px-4">
        <button className="flex items-center gap-2 py-2 px-4 bg-blue-500 text-white border-none rounded text-sm font-semibold cursor-pointer transition-all hover:bg-blue-600 hover:-translate-x-0.5 max-md:py-1.5 max-md:px-3 max-md:text-[13px]" onClick={() => navigate('/projects')}>← Back to Projects</button>
      </div>

      <div className="flex-1 flex items-start justify-center py-8 px-5 w-full max-md:py-5 max-md:px-2.5">
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-10 w-full max-w-full max-md:p-6 max-sm:p-4">
          {/* Project Info */}
          <div className="mb-10 pb-10 border-b border-gray-200 max-sm:mb-5 max-sm:pb-5">
            <div className="flex justify-between items-center mb-5 gap-5 max-md:flex-col max-md:items-start">
              <h1 className="m-0 text-3xl text-slate-800 font-bold max-md:text-2xl max-sm:text-xl">{project.name}</h1>
              <span className={`inline-block px-3 py-1.5 rounded text-xs font-bold uppercase ${statusColors[project.status] || ''}`}>{project.status}</span>
            </div>
            <p className="m-0 mb-5 text-base text-gray-500 leading-relaxed">{project.description || 'No description'}</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-8 max-md:grid-cols-1">
              {[{ label: 'Owner', value: project.owner_name }, { label: 'Status', value: project.status, isStatus: true }, ...(project.start_date ? [{ label: 'Start Date', value: new Date(project.start_date).toLocaleDateString() }] : []), ...(project.end_date ? [{ label: 'End Date', value: new Date(project.end_date).toLocaleDateString() }] : [])].map((item, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</label>
                  {item.isStatus ? <span className={`inline-block self-start px-3 py-1.5 rounded text-xs font-bold uppercase ${statusColors[project.status] || ''}`}>{item.value}</span> : <span className="text-[15px] text-slate-800 font-medium">{item.value}</span>}
                </div>
              ))}
            </div>
            <div className="flex gap-3 max-md:flex-col">
              <button className="py-2.5 px-5 bg-blue-500 text-white border-none rounded text-sm font-semibold cursor-pointer transition-all hover:bg-blue-600 max-md:w-full" onClick={() => navigate(`/projects/${id}/edit`)}>Edit Project</button>
              <button className="py-2.5 px-5 bg-red-500 text-white border-none rounded text-sm font-semibold cursor-pointer transition-all hover:bg-red-600 max-md:w-full" onClick={handleDelete}>Delete Project</button>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-10 max-lg:grid-cols-1 max-lg:gap-8">
            <div className="flex flex-col gap-5">
              <h2 className="m-0 text-xl text-slate-800 font-bold">Attachments</h2>
              <ProjectAttachments projectId={id} canEdit={can('projects', 'update')} onAttachmentChange={fetchProjectDetails} />
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center mb-0 gap-4 max-md:flex-col max-md:items-start">
                <h2 className="m-0 text-xl text-slate-800 font-bold">Project Tasks</h2>
                <button className="py-2.5 px-4 bg-green-600 text-white border-none rounded text-[13px] font-semibold cursor-pointer transition-all whitespace-nowrap hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(39,174,96,0.3)] max-md:w-full" onClick={() => setShowCreateTask(!showCreateTask)}>+ Create Task</button>
              </div>

              {showCreateTask && (
                <form className="bg-gray-50 border border-gray-200 rounded-md p-5 flex flex-col gap-4 max-sm:p-4 max-sm:gap-3" onSubmit={handleCreateTask}>
                  <div className="flex flex-col gap-2"><label className="text-[13px] font-semibold text-slate-800">Task Title *</label><input type="text" placeholder="Enter task title" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} required className="py-2.5 px-3 border border-gray-400 rounded text-[13px] font-inherit transition-all focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(52,152,219,0.1)] focus:bg-blue-50/50" /></div>
                  <div className="flex flex-col gap-2"><label className="text-[13px] font-semibold text-slate-800">Description</label><textarea placeholder="Enter task description" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} rows="3" className="py-2.5 px-3 border border-gray-400 rounded text-[13px] font-inherit transition-all resize-y min-h-[80px] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(52,152,219,0.1)] focus:bg-blue-50/50" /></div>
                  <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                    <div className="flex flex-col gap-2"><label className="text-[13px] font-semibold text-slate-800">Assign To</label><select value={newTask.assigned_to} onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})} className="py-2.5 px-3 border border-gray-400 rounded text-[13px] cursor-pointer bg-white transition-all focus:outline-none focus:border-blue-500"><option value="">Select team member</option>{users.map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select></div>
                    <div className="flex flex-col gap-2"><label className="text-[13px] font-semibold text-slate-800">Priority</label><select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} className="py-2.5 px-3 border border-gray-400 rounded text-[13px] cursor-pointer bg-white transition-all focus:outline-none focus:border-blue-500"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                  </div>
                  <div className="flex flex-col gap-2"><label className="text-[13px] font-semibold text-slate-800">Due Date</label><input type="date" value={newTask.due_date} onChange={(e) => setNewTask({...newTask, due_date: e.target.value})} className="py-2.5 px-3 border border-gray-400 rounded text-[13px] transition-all focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(52,152,219,0.1)]" /></div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-slate-800">Attach Files</label>
                    <input type="file" multiple onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} className="py-2.5 px-3 border-2 border-dashed border-blue-500 rounded bg-blue-50 cursor-pointer transition-all hover:border-blue-600 hover:bg-blue-100/50" />
                    <p className="m-0 mt-1.5 text-xs text-gray-500 italic">You can select multiple files</p>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 mt-2">
                      <label className="block text-xs font-semibold text-slate-800 mb-2.5">Selected Files ({selectedFiles.length})</label>
                      <ul className="list-none m-0 p-0 flex flex-col gap-2">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="flex items-center gap-2 py-2 px-2.5 bg-white border border-gray-200 rounded text-xs">
                            <span className="flex-1 text-slate-800 font-medium break-words">📎 {file.name}</span>
                            <span className="text-gray-400 text-[11px] whitespace-nowrap">({(file.size / 1024).toFixed(2)} KB)</span>
                            <button type="button" className="bg-red-500 text-white border-none rounded w-5 h-5 p-0 flex items-center justify-center cursor-pointer text-xs font-bold transition-all shrink-0 hover:bg-red-600 hover:scale-110" onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}>✕</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-3 mt-2 max-md:flex-col">
                    <button type="submit" className="flex-1 py-2.5 px-4 bg-green-600 text-white border-none rounded text-[13px] font-semibold cursor-pointer transition-all hover:bg-green-700 active:scale-[0.98] max-md:w-full">Create Task</button>
                    <button type="button" className="flex-1 py-2.5 px-4 bg-gray-200 text-slate-800 border-none rounded text-[13px] font-semibold cursor-pointer transition-all hover:bg-gray-300 max-md:w-full" onClick={() => setShowCreateTask(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="flex flex-col gap-3">
                {tasks.length > 0 ? tasks.map(task => (
                  <div key={task.id} className="bg-gray-50 border border-gray-200 rounded-md p-4 transition-all flex flex-col hover:bg-gray-100 hover:border-gray-400 hover:shadow max-sm:p-3">
                    <div className="flex justify-between items-center mb-2 gap-2.5">
                      <h3 className="m-0 text-[15px] text-slate-800 font-semibold flex-1 max-sm:text-sm">{task.title}</h3>
                      <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase whitespace-nowrap shrink-0 ${statusColors[task.status] || ''}`}>{task.status}</span>
                    </div>
                    <p className="m-0 mb-2.5 text-[13px] text-gray-500 leading-snug">{task.description || 'No description'}</p>
                    <div className="flex gap-2.5 flex-wrap">
                      {task.assigned_to_name && <span className="inline-block bg-gray-200 text-slate-800 px-2.5 py-1 rounded text-xs font-medium">👤 {task.assigned_to_name}</span>}
                      {task.priority && <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${metaPriorityColors[task.priority] || 'bg-gray-200 text-slate-800'}`}>⚡ {task.priority}</span>}
                      {task.due_date && <span className="inline-block bg-gray-200 text-slate-800 px-2.5 py-1 rounded text-xs font-medium">📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                )) : <p className="text-center text-gray-400 text-sm p-5 bg-gray-50 rounded-md">No tasks in this project yet</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
