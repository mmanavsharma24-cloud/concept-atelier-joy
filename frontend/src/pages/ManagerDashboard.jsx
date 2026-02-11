import { useState, useEffect } from 'react';
import { projectService, taskService, userService } from '../services/api';
import { handleAPIError, showError } from '../utils/errorHandler';

const ManagerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filterType, setFilterType] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData, usersData] = await Promise.all([
        projectService.getAll(), taskService.getAll(), userService.getAll(),
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
      setUsers(usersData);

      const completedTasks = tasksData.filter(t => t.status === 'completed').length;
      const inProgressTasks = tasksData.filter(t => t.status === 'in_progress').length;
      const pendingTasks = tasksData.filter(t => t.status === 'pending').length;

      setStats({
        totalProjects: projectsData.length,
        activeProjects: projectsData.filter(p => p.status === 'active').length,
        totalTasks: tasksData.length,
        completedTasks, inProgressTasks, pendingTasks,
        completionRate: tasksData.length > 0 ? Math.round((completedTasks / tasksData.length) * 100) : 0,
        teamSize: usersData.filter(u => u.role === 'user').length,
      });
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load manager data');
      showError(message);
      setLoading(false);
    }
  };

  const handleStatCardClick = (type) => { setFilterType(type); };

  if (loading) return <div className="text-center p-12 text-lg text-gray-500">Loading manager dashboard...</div>;

  const renderProjectCard = (project) => {
    const projectTasks = tasks.filter(t => t.project_id === project.id);
    const completedProjectTasks = projectTasks.filter(t => t.status === 'completed').length;
    const progress = projectTasks.length > 0 ? Math.round((completedProjectTasks / projectTasks.length) * 100) : 0;

    return (
      <div key={project.id} className="bg-gradient-to-br from-blue-50/50 to-white p-5 rounded-xl border-l-4 border-l-orange-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        <div className="flex justify-between items-start mb-2.5">
          <h3 className="m-0 text-base text-slate-800 font-bold">{project.name}</h3>
          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold capitalize ${project.status === 'active' ? 'bg-green-100 text-green-800' : project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{project.status}</span>
        </div>
        <p className="text-[13px] text-gray-500 my-2 leading-relaxed">{project.description || 'No description'}</p>
        <div className="flex gap-4 my-4 py-2.5 border-y border-y-gray-100">
          {[['Tasks', projectTasks.length], ['Completed', completedProjectTasks], ['Progress', `${progress}%`]].map(([label, value]) => (
            <div key={label} className="flex-1 text-center">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">{label}:</span>
              <span className="text-base font-bold text-orange-400">{value}</span>
            </div>
          ))}
        </div>
        <div className="w-full h-5 bg-gray-100 rounded-xl overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen max-md:p-5 max-sm:p-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl text-slate-800 m-0 mb-2.5 font-extrabold max-md:text-[28px] max-sm:text-[22px]">📊 Manager Dashboard</h1>
        <p className="text-base text-gray-500 m-0">Team and project management overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5 mb-10 max-md:grid-cols-2 max-sm:grid-cols-1">
        {[
          { icon: '📁', num: stats.totalProjects, label: 'Total Projects', type: 'projects' },
          { icon: '✅', num: stats.activeProjects, label: 'Active Projects', type: 'active-projects' },
          { icon: '📋', num: stats.totalTasks, label: 'Total Tasks', type: 'tasks' },
          { icon: '⚡', num: stats.inProgressTasks, label: 'In Progress', type: 'in-progress' },
          { icon: '✔️', num: `${stats.completionRate}%`, label: 'Completion Rate', type: null },
          { icon: '👥', num: stats.teamSize, label: 'Team Members', type: 'team' },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-md border-l-[5px] border-l-orange-400 flex gap-3 items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${stat.type ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={() => stat.type && handleStatCardClick(stat.type)}
          >
            <div className="text-[28px] min-w-[45px]">{stat.icon}</div>
            <div className="flex-1">
              <div className="text-2xl font-extrabold text-slate-800 m-0">{stat.num}</div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtered Content */}
      {filterType && (
        <div className="bg-gradient-to-br from-white to-blue-50/50 p-8 rounded-xl shadow-md mb-8 border border-orange-400/10 max-md:p-5">
          <div className="flex items-center gap-4 mb-5">
            <button className="px-3.5 py-2 bg-gray-100 text-slate-800 border-none rounded-md text-xs font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-300" onClick={() => setFilterType(null)}>← Back</button>
            <h2 className="m-0 text-[22px] font-bold text-slate-800 border-none p-0">
              📊 {filterType === 'projects' ? 'All Projects' : filterType === 'active-projects' ? 'Active Projects' : filterType === 'tasks' ? 'All Tasks' : filterType === 'in-progress' ? 'In Progress Tasks' : 'Team Members'}
            </h2>
          </div>
          
          {(filterType === 'projects' || filterType === 'active-projects') && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 max-xl:grid-cols-2 max-md:grid-cols-1">
              {(filterType === 'active-projects' ? projects.filter(p => p.status === 'active') : projects).length > 0 ? (
                (filterType === 'active-projects' ? projects.filter(p => p.status === 'active') : projects).map(renderProjectCard)
              ) : (
                <p className="text-center text-gray-400 italic p-8">No {filterType === 'active-projects' ? 'active ' : ''}projects found</p>
              )}
            </div>
          )}

          {(filterType === 'tasks' || filterType === 'in-progress') && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-br from-gray-100 to-gray-200 border-b-2 border-b-orange-400">
                  <tr>
                    {['Task Name', 'Status', 'Priority', 'Assigned To'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-bold text-slate-800 text-[11px] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(filterType === 'in-progress' ? tasks.filter(t => t.status === 'in_progress') : tasks).length > 0 ? (
                    (filterType === 'in-progress' ? tasks.filter(t => t.status === 'in_progress') : tasks).map(task => (
                      <tr key={task.id} className="hover:bg-blue-50">
                        <td className="px-4 py-3 border-b border-b-gray-100 text-[13px] text-slate-800">{task.title}</td>
                        <td className="px-4 py-3 border-b border-b-gray-100 text-[13px]"><span className={`inline-block px-2 py-1 rounded text-[10px] font-bold capitalize ${task.status === 'completed' ? 'bg-green-100 text-green-800' : task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{task.status}</span></td>
                        <td className="px-4 py-3 border-b border-b-gray-100 text-[13px]"><span className={`inline-block px-2 py-1 rounded text-[10px] font-bold capitalize ${task.priority === 'critical' ? 'bg-red-100 text-red-800' : task.priority === 'high' ? 'bg-yellow-100 text-yellow-800' : task.priority === 'medium' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{task.priority}</span></td>
                        <td className="px-4 py-3 border-b border-b-gray-100 text-[13px] text-slate-800">{task.assigned_to_name || 'Unassigned'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="text-center text-gray-400 italic p-8">No {filterType === 'in-progress' ? 'in-progress ' : ''}tasks found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {filterType === 'team' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-br from-gray-100 to-gray-200 border-b-2 border-b-orange-400">
                  <tr>
                    {['Name', 'Email', 'Department'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-bold text-slate-800 text-[11px] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role === 'user').length > 0 ? (
                    users.filter(u => u.role === 'user').map(user => (
                      <tr key={user.id} className="hover:bg-blue-50">
                        <td className="px-4 py-3 border-b border-b-gray-100 text-[13px] text-slate-800">{user.full_name}</td>
                        <td className="px-4 py-3 border-b border-b-gray-100 text-[13px] text-slate-800">{user.email}</td>
                        <td className="px-4 py-3 border-b border-b-gray-100 text-[13px] text-slate-800">{user.department || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="text-center text-gray-400 italic p-8">No team members found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Default View */}
      {!filterType && (
        <>
          {/* Task Distribution */}
          <div className="bg-gradient-to-br from-white to-blue-50/50 p-8 rounded-xl shadow-md mb-8 border border-orange-400/10 max-md:p-5">
            <h2 className="text-[22px] text-slate-800 m-0 mb-5 font-bold border-b-[3px] border-b-orange-400 pb-4">📊 Task Distribution</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-5 max-sm:grid-cols-1">
              {[
                { icon: '⏳', num: stats.pendingTasks, label: 'Pending', pct: stats.totalTasks > 0 ? Math.round((stats.pendingTasks / stats.totalTasks) * 100) : 0 },
                { icon: '⚡', num: stats.inProgressTasks, label: 'In Progress', pct: stats.totalTasks > 0 ? Math.round((stats.inProgressTasks / stats.totalTasks) * 100) : 0 },
                { icon: '✅', num: stats.completedTasks, label: 'Completed', pct: stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0 },
              ].map((d, i) => (
                <div key={i} className="bg-gradient-to-br from-blue-50/50 to-white p-5 rounded-xl border-2 border-gray-100 text-center transition-all duration-300 hover:border-orange-400 hover:shadow-md">
                  <div className="text-[32px] mb-2.5">{d.icon}</div>
                  <div className="text-[28px] font-extrabold text-slate-800 my-2.5">{d.num}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">{d.label}</div>
                  <div className="text-sm font-bold text-orange-400">{d.pct}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects List */}
          <div className="bg-gradient-to-br from-white to-blue-50/50 p-8 rounded-xl shadow-md mb-8 border border-orange-400/10 max-md:p-5">
            <h2 className="text-[22px] text-slate-800 m-0 mb-5 font-bold border-b-[3px] border-b-orange-400 pb-4">📁 My Projects</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 max-xl:grid-cols-2 max-md:grid-cols-1">
              {projects.length > 0 ? projects.map(renderProjectCard) : <p className="text-center text-gray-400 italic p-8">No projects found</p>}
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-gradient-to-br from-white to-blue-50/50 p-8 rounded-xl shadow-md mb-8 border border-orange-400/10 max-md:p-5">
            <h2 className="text-[22px] text-slate-800 m-0 mb-5 font-bold border-b-[3px] border-b-orange-400 pb-4">👥 Team Performance</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 max-sm:grid-cols-1">
              {[
                { title: 'Task Completion', items: [['Completed', stats.completedTasks], ['In Progress', stats.inProgressTasks], ['Pending', stats.pendingTasks]] },
                { title: 'Team Overview', items: [['Team Size', stats.teamSize], ['Active Projects', stats.activeProjects], ['Completion Rate', `${stats.completionRate}%`]] },
              ].map((card, i) => (
                <div key={i} className="bg-gradient-to-br from-blue-50/50 to-white p-5 rounded-xl border-2 border-gray-100 transition-all duration-300 hover:border-orange-400 hover:shadow-md">
                  <h3 className="text-sm text-slate-800 m-0 mb-4 font-bold uppercase tracking-wider">{card.title}</h3>
                  <div className="flex flex-col gap-3">
                    {card.items.map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center text-[13px] text-gray-500">
                        <span>{label}:</span>
                        <strong className="text-orange-400 font-bold text-base">{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;
