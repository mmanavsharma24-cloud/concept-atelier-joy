import { useState, useEffect } from 'react';
import { projectService, taskService, userService } from '../services/api';
import { handleAPIError, showError } from '../utils/errorHandler';
import { useAuth } from '../hooks/useAuth';
import ProjectsOverviewChart from '../components/charts/ProjectsOverviewChart';
import TasksByStatusChart from '../components/charts/TasksByStatusChart';
import TasksByPriorityChart from '../components/charts/TasksByPriorityChart';
import TasksByAssigneeChart from '../components/charts/TasksByAssigneeChart';

const priorityColors = { low: 'bg-green-100 text-green-800 border border-green-300', medium: 'bg-blue-100 text-blue-800 border border-blue-300', high: 'bg-yellow-100 text-yellow-800 border border-yellow-300', critical: 'bg-red-100 text-red-800 border border-red-300' };
const statusColors = { pending: 'bg-gray-200 text-gray-700 border border-gray-300', in_progress: 'bg-yellow-100 text-yellow-800 border border-yellow-300', completed: 'bg-green-100 text-green-800 border border-green-300', active: 'bg-green-100 text-green-800 border border-green-300', planning: 'bg-blue-100 text-blue-800 border border-blue-300' };

const Analytics = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const usersData = await userService.getAll();
      setProjects(projectsData);
      setTasks(tasksData);
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load analytics');
      showError(message);
      setLoading(false);
    }
  };

  const getTaskStats = () => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    critical: tasks.filter(t => t.priority === 'critical').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  });

  const getProjectStats = () => ({
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    planning: projects.filter(p => p.status === 'planning').length,
  });

  if (loading) return <div className="text-center p-12 text-lg text-gray-500">Loading analytics...</div>;

  const taskStats = getTaskStats();
  const projectStats = getProjectStats();

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-300 min-h-screen max-md:p-5 max-sm:p-4">
      <div className="mb-12 text-center">
        <h1 className="text-2xl text-slate-800 mb-2.5 font-extrabold tracking-tight">📊 Analytics & Reports</h1>
        <p className="text-[13px] text-gray-500 font-medium">Comprehensive overview of your projects and tasks</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8 max-lg:grid-cols-2 max-md:grid-cols-1">
        {[
          { title: 'Total Tasks', value: taskStats.total, items: [`✓ ${taskStats.completed} Completed`, `⚡ ${taskStats.inProgress} In Progress`, `⏳ ${taskStats.pending} Pending`] },
          { title: 'Total Projects', value: projectStats.total, items: [`✓ ${projectStats.active} Active`, `⚡ ${projectStats.inProgress} In Progress`, `📋 ${projectStats.planning} Planning`] },
          { title: 'Task Priority', value: taskStats.critical, items: [`🔴 ${taskStats.critical} Critical`, `🟠 ${taskStats.high} High`, `🟡 ${taskStats.medium} Medium`] },
          { title: 'Team Members', value: users.length, items: ['👥 Active Users'] },
        ].map((stat, i) => (
          <div key={i} className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-l-4 border-blue-500 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] relative overflow-hidden">
            <h3 className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider font-bold">{stat.title}</h3>
            <p className="text-3xl text-slate-800 mb-3 font-extrabold max-md:text-2xl">{stat.value}</p>
            <div className="flex flex-col gap-1.5 text-[11px] text-gray-500 relative z-[1]">
              {stat.items.map((item, j) => <span key={j} className="flex items-center gap-2 font-medium">{item}</span>)}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-4 mb-8 max-lg:grid-cols-1">
        {[<ProjectsOverviewChart projects={projects} />, <TasksByStatusChart tasks={tasks} />, <TasksByPriorityChart tasks={tasks} />, <TasksByAssigneeChart tasks={tasks} users={users} />].map((chart, i) => (
          <div key={i} className="bg-gradient-to-br from-white to-blue-50 p-4 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-blue-500/10 transition-all hover:shadow-[0_4px_18px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-gradient-to-r before:from-blue-500 before:via-purple-500 before:to-red-500">
            {chart}
          </div>
        ))}
      </div>

      {/* Tables */}
      {[
        { title: '📋 All Tasks', data: tasks, columns: ['Task Name', 'Assigned To', 'Priority', 'Status', 'Due Date'], renderRow: (task) => (
          <tr key={task.id} className="transition-all hover:bg-blue-50">
            <td className="p-2.5 border-b border-gray-100 text-xs text-slate-800 font-bold text-blue-500">{task.title}</td>
            <td className="p-2.5 border-b border-gray-100 text-xs text-slate-800">{task.assigned_to_name || 'Unassigned'}</td>
            <td className="p-2.5 border-b border-gray-100 text-xs"><span className={`inline-block px-2 py-1 rounded text-[10px] font-bold capitalize shadow-sm ${priorityColors[task.priority] || ''}`}>{task.priority}</span></td>
            <td className="p-2.5 border-b border-gray-100 text-xs"><span className={`inline-block px-2 py-1 rounded text-[10px] font-bold capitalize shadow-sm ${statusColors[task.status] || ''}`}>{task.status === 'pending' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Done'}</span></td>
            <td className="p-2.5 border-b border-gray-100 text-xs text-slate-800">{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
          </tr>
        )},
        { title: '📁 All Projects', data: projects, columns: ['Project Name', 'Owner', 'Status', 'Start Date', 'End Date'], renderRow: (project) => (
          <tr key={project.id} className="transition-all hover:bg-blue-50">
            <td className="p-2.5 border-b border-gray-100 text-xs text-blue-500 font-bold">{project.name}</td>
            <td className="p-2.5 border-b border-gray-100 text-xs text-slate-800">{project.owner_name}</td>
            <td className="p-2.5 border-b border-gray-100 text-xs"><span className={`inline-block px-2 py-1 rounded text-[10px] font-bold capitalize shadow-sm ${statusColors[project.status] || ''}`}>{project.status}</span></td>
            <td className="p-2.5 border-b border-gray-100 text-xs text-slate-800">{project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}</td>
            <td className="p-2.5 border-b border-gray-100 text-xs text-slate-800">{project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}</td>
          </tr>
        )},
      ].map((section, i) => (
        <div key={i} className="bg-gradient-to-br from-white to-blue-50 p-5 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-5 border border-blue-500/10">
          <h2 className="text-base text-slate-800 mb-4 font-bold border-b-2 border-blue-500 pb-2.5 tracking-tight">{section.title}</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-br from-gray-100 to-gray-200 border-b-[3px] border-blue-500">
                <tr>{section.columns.map((col, j) => <th key={j} className="p-3 text-left font-bold text-slate-800 text-[11px] uppercase tracking-wider">{col}</th>)}</tr>
              </thead>
              <tbody>
                {section.data.length > 0 ? section.data.map(section.renderRow) : (
                  <tr><td colSpan={section.columns.length} className="text-center text-gray-500 italic p-8">No data found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Analytics;
