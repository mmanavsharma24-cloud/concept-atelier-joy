import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { projectService, taskService } from '../services/api';
import { handleAPIError, showError } from '../utils/errorHandler';

const statusColors = { active: 'bg-green-100 text-green-800', in_progress: 'bg-yellow-100 text-yellow-800', planning: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800', pending: 'bg-gray-200 text-gray-700' };
const priorityColors = { low: 'bg-green-100 text-green-800', medium: 'bg-blue-100 text-blue-800', high: 'bg-yellow-100 text-yellow-800', critical: 'bg-red-100 text-red-800' };
const statusDotColors = { pending: 'bg-red-500', in_progress: 'bg-yellow-500', completed: 'bg-green-500' };
const borderColors = { projects: 'border-l-blue-500', tasks: 'border-l-purple-500', progress: 'border-l-yellow-500', completed: 'border-l-green-500' };

const Home = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      let projectsData, tasksData;
      if (user?.role === 'user') {
        projectsData = await projectService.getUserAnalytics();
        tasksData = await taskService.getUserAnalytics();
      } else {
        projectsData = await projectService.getAll();
        tasksData = await taskService.getAll();
      }
      setProjects(projectsData);
      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load dashboard');
      showError(message);
      setLoading(false);
    }
  };

  const getRecentTasks = () => tasks.slice(0, 5);
  const getActiveTasks = () => tasks.filter(t => t.status === 'in_progress');
  const getCompletedTasks = () => tasks.filter(t => t.status === 'completed');

  if (loading) return <div className="text-center p-12 text-lg text-gray-500">Loading...</div>;

  const stats = [
    { key: 'projects', icon: '📁', value: projects.length, label: 'Projects', filter: 'projects' },
    { key: 'tasks', icon: '✓', value: tasks.length, label: 'Total Tasks', filter: 'all-tasks' },
    { key: 'progress', icon: '⚡', value: getActiveTasks().length, label: 'In Progress', filter: 'in-progress' },
    { key: 'completed', icon: '✅', value: getCompletedTasks().length, label: 'Completed', filter: 'completed' },
  ];

  const renderTasksTable = (tasksToShow) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gradient-to-br from-gray-100 to-gray-200 border-b-2 border-blue-500">
          <tr>{['Task Name', 'Status', 'Priority', 'Assigned To'].map(h => <th key={h} className="p-3 text-left font-bold text-slate-800 text-[11px] uppercase tracking-wider">{h}</th>)}</tr>
        </thead>
        <tbody>
          {tasksToShow.length > 0 ? tasksToShow.map(task => (
            <tr key={task.id} className="hover:bg-blue-50 transition-all">
              <td className="p-3 border-b border-gray-100 text-[13px] text-slate-800">{task.title}</td>
              <td className="p-3 border-b border-gray-100"><span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold capitalize ${statusColors[task.status] || ''}`}>{task.status}</span></td>
              <td className="p-3 border-b border-gray-100"><span className={`inline-block px-2.5 py-1 rounded text-[11px] font-semibold capitalize ${priorityColors[task.priority] || ''}`}>{task.priority}</span></td>
              <td className="p-3 border-b border-gray-100 text-[13px]">{task.assigned_to_name || 'Unassigned'}</td>
            </tr>
          )) : <tr><td colSpan="4" className="text-center text-gray-400 italic p-8">No tasks found</td></tr>}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen max-md:p-5">
      <div className="mb-10">
        <h1 className="text-2xl text-slate-800 mb-2 font-bold max-md:text-xl">Welcome back, {user?.full_name}! 👋</h1>
        <p className="text-[13px] text-gray-500">Here's what's happening with your work today</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-10 max-lg:grid-cols-2 max-md:grid-cols-1">
        {stats.map(s => (
          <div key={s.key} className={`bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-4 transition-all cursor-pointer border-l-4 ${borderColors[s.key]} hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] max-md:p-4`} onClick={() => setFilterType(s.filter)}>
            <div className="text-3xl min-w-[50px] text-center">{s.icon}</div>
            <div className="flex-1">
              <div className="text-[22px] font-bold text-slate-800 leading-none max-md:text-2xl">{s.value}</div>
              <div className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {filterType ? (
        <div>
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] max-md:p-4">
            <div className="flex items-center gap-4 mb-5">
              <button className="py-2 px-3.5 bg-gray-100 text-slate-800 border-none rounded-md text-xs font-semibold cursor-pointer transition-all hover:bg-gray-300 hover:-translate-x-0.5" onClick={() => setFilterType(null)}>← Back</button>
              <h2 className="m-0 text-xl font-bold">
                {filterType === 'projects' ? '📁 My Projects' : filterType === 'all-tasks' ? '✓ All Tasks' : filterType === 'in-progress' ? '⚡ In Progress Tasks' : '✅ Completed Tasks'}
              </h2>
            </div>

            {filterType === 'projects' && (
              <div className="flex flex-col gap-4">
                {projects.length > 0 ? projects.map(project => (
                  <div key={project.id} className="p-4 border border-gray-200 rounded-lg transition-all hover:border-blue-500 hover:bg-blue-50/50">
                    <div className="flex justify-between items-start mb-2.5">
                      <h3 className="text-[13px] text-slate-800 font-semibold">{project.name}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold capitalize ${statusColors[project.status] || ''}`}>{project.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 my-1.5 leading-snug">{project.description || 'No description'}</p>
                    <small className="text-xs text-gray-400">👤 {project.owner_name}</small>
                  </div>
                )) : <p className="text-center text-gray-400 italic p-8">No projects found</p>}
              </div>
            )}
            {filterType === 'all-tasks' && renderTasksTable(tasks)}
            {filterType === 'in-progress' && renderTasksTable(getActiveTasks())}
            {filterType === 'completed' && renderTasksTable(getCompletedTasks())}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-8 max-lg:grid-cols-1">
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] max-md:p-4">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base text-slate-800 font-semibold">📋 Recent Projects</h2>
              {projects.length === 0 && <p className="text-[13px] text-gray-400">No projects yet</p>}
            </div>
            <div className="flex flex-col gap-4">
              {projects.slice(0, 5).map(project => (
                <div key={project.id} className="p-4 border border-gray-200 rounded-lg transition-all hover:border-blue-500 hover:bg-blue-50/50">
                  <div className="flex justify-between items-start mb-2.5">
                    <h3 className="text-[13px] text-slate-800 font-semibold">{project.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold capitalize ${statusColors[project.status] || ''}`}>{project.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 my-1.5 leading-snug">{project.description || 'No description'}</p>
                  <small className="text-xs text-gray-400">👤 {project.owner_name}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] max-md:p-4">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base text-slate-800 font-semibold">📝 Recent Tasks</h2>
              {tasks.length === 0 && <p className="text-[13px] text-gray-400">No tasks yet</p>}
            </div>
            <div className="flex flex-col gap-3">
              {getRecentTasks().map(task => (
                <div key={task.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg transition-all hover:border-blue-500 hover:bg-blue-50/50">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full min-w-[8px] ${statusDotColors[task.status] || 'bg-gray-400'}`}></div>
                    <div>
                      <h4 className="text-xs text-slate-800 mb-1 font-semibold">{task.title}</h4>
                      <small className="text-[11px] text-gray-400">👤 {task.assigned_to_name || 'Unassigned'}</small>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-semibold capitalize ${priorityColors[task.priority] || ''}`}>{task.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
