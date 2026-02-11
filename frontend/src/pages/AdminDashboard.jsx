import { useState, useEffect } from 'react';
import { userService, projectService, taskService } from '../services/api';
import { handleAPIError, showError } from '../utils/errorHandler';
import UserProfileModal from '../components/modals/UserProfileModal';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [filterType, setFilterType] = useState(null);
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, projectsData, tasksData] = await Promise.all([
        userService.getAll(), projectService.getAll(), taskService.getAll(),
      ]);
      setUsers(usersData);
      setProjects(projectsData);
      setTasks(tasksData);

      const teamsByManager = {};
      usersData.forEach(user => {
        if (user.role === 'manager') {
          teamsByManager[user.id] = {
            manager: user,
            members: usersData.filter(u => u.manager_id === user.id || (u.department === user.department && u.role === 'user'))
          };
        }
      });
      setTeams(Object.values(teamsByManager));

      setStats({
        totalUsers: usersData.length,
        admins: usersData.filter(u => u.role === 'admin').length,
        managers: usersData.filter(u => u.role === 'manager').length,
        teamMembers: usersData.filter(u => u.role === 'user').length,
        totalProjects: projectsData.length,
        activeProjects: projectsData.filter(p => p.status === 'active').length,
        totalTasks: tasksData.length,
        completedTasks: tasksData.filter(t => t.status === 'completed').length,
        taskCompletionRate: projectsData.length > 0 
          ? Math.round((tasksData.filter(t => t.status === 'completed').length / tasksData.length) * 100) : 0,
      });
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load admin data');
      showError(message);
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = { admin: '#e74c3c', manager: '#f39c12', user: '#3498db' };
    return colors[role] || '#95a5a6';
  };

  const handleStatCardClick = (type) => {
    let filtered = [];
    switch(type) {
      case 'all': filtered = users; break;
      case 'admin': filtered = users.filter(u => u.role === 'admin'); break;
      case 'manager': filtered = users.filter(u => u.role === 'manager'); break;
      case 'user': filtered = users.filter(u => u.role === 'user'); break;
      default: filtered = users;
    }
    setFilteredEmployees(filtered);
    setFilterType(type);
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const getSearchedEmployees = () => {
    let employees = filterType === 'user' ? [] : filteredEmployees;
    if (!searchQuery.trim()) return employees;
    return employees.filter(emp => 
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.department && emp.department.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const getSearchedTeams = () => {
    if (!searchQuery.trim()) return teams;
    return teams.map(team => ({
      ...team,
      members: team.members.filter(member =>
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.department && member.department.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })).filter(team => team.members.length > 0);
  };

  if (loading) return <div className="text-center p-12 text-lg text-gray-500">Loading admin dashboard...</div>;

  return (
    <div className="p-8 bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen max-md:p-5 max-sm:p-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl text-slate-800 m-0 mb-2.5 font-extrabold max-md:text-[28px] max-sm:text-[22px]">🔐 Admin Dashboard</h1>
        <p className="text-base text-gray-500 m-0">System overview and management</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-10 max-md:grid-cols-2 max-sm:grid-cols-1">
        {[
          { icon: '👥', num: stats.totalUsers, label: 'Total Users', type: 'all' },
          { icon: '🔴', num: stats.admins, label: 'Administrators', type: 'admin' },
          { icon: '🟠', num: stats.managers, label: 'Managers', type: 'manager' },
          { icon: '🟡', num: stats.teamMembers, label: 'Team Members', type: 'user' },
          { icon: '📁', num: stats.totalProjects, label: 'Total Projects', type: 'projects' },
          { icon: '✅', num: `${stats.taskCompletionRate}%`, label: 'Task Completion', type: null },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-md border-l-[5px] border-l-blue-500 flex gap-4 items-center transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg max-sm:p-4"
            onClick={() => stat.type && handleStatCardClick(stat.type)}
          >
            <div className="text-[32px] min-w-[50px]">{stat.icon}</div>
            <div className="flex-1">
              <div className="text-[28px] font-extrabold text-slate-800 m-0">{stat.num}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Employee Management */}
      {filterType && filterType !== 'projects' && (
        <div className="bg-gradient-to-br from-white to-blue-50/50 p-8 rounded-xl shadow-md mb-8 border border-blue-500/10 max-md:p-5">
          <div className="flex items-center gap-4 mb-5">
            <button className="px-3.5 py-2 bg-gray-100 text-slate-800 border-none rounded-md text-xs font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-300 hover:-translate-x-0.5" onClick={() => setFilterType(null)}>← Back</button>
            <h2 className="m-0 text-[22px] font-bold text-slate-800">
              👨‍💼 {filterType === 'all' ? 'All Employees' : filterType === 'admin' ? 'Administrators' : filterType === 'manager' ? 'Managers' : 'Team Members'}
            </h2>
          </div>

          <div className="relative mb-5">
            <input
              type="text"
              className="w-full py-3 pl-4 pr-10 border-2 border-gray-100 rounded-lg text-[13px] text-slate-800 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10 placeholder:text-gray-400"
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-lg text-gray-400 cursor-pointer px-2 py-1 transition-colors duration-300 hover:text-red-500" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          <div className="flex flex-col border border-gray-100 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[2fr_1.5fr_1fr] gap-4 px-4 py-3 bg-gradient-to-br from-gray-100 to-gray-200 border-b-2 border-b-blue-500 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              <div>Employee Name</div>
              <div>Department</div>
              <div>Role</div>
            </div>
            {filterType === 'user' ? (
              getSearchedTeams().length > 0 ? (
                getSearchedTeams().map(team => (
                  <div key={team.manager.id} className="border-b-2 border-b-gray-100 mb-4 last:border-b-0">
                    <div className="px-4 py-3 bg-blue-50 border-l-4 border-l-blue-500 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <strong>{team.manager.full_name}'s Team</strong> - {team.members.length} members
                    </div>
                    {team.members.map(member => (
                      <div key={member.id} className="grid grid-cols-[2fr_1.5fr_1fr] gap-4 px-4 py-3 border-b border-b-gray-100 items-center cursor-pointer transition-all duration-200 hover:bg-blue-50 last:border-b-0" onClick={() => handleEmployeeClick(member)}>
                        <div className="text-[13px] font-semibold text-blue-500">{member.full_name}</div>
                        <div className="text-xs text-slate-800">{member.department || '-'}</div>
                        <div><span className="inline-block px-2.5 py-1 rounded-xl text-[10px] font-bold text-white uppercase tracking-tight" style={{ backgroundColor: getRoleBadgeColor(member.role) }}>{member.role}</span></div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 italic text-[13px]">No team members found matching "{searchQuery}"</div>
              )
            ) : (
              getSearchedEmployees().length > 0 ? (
                getSearchedEmployees().map(user => (
                  <div key={user.id} className="grid grid-cols-[2fr_1.5fr_1fr] gap-4 px-4 py-3 border-b border-b-gray-100 items-center cursor-pointer transition-all duration-200 hover:bg-blue-50 last:border-b-0" onClick={() => handleEmployeeClick(user)}>
                    <div className="text-[13px] font-semibold text-blue-500">{user.full_name}</div>
                    <div className="text-xs text-slate-800">{user.department || '-'}</div>
                    <div><span className="inline-block px-2.5 py-1 rounded-xl text-[10px] font-bold text-white uppercase tracking-tight" style={{ backgroundColor: getRoleBadgeColor(user.role) }}>{user.role}</span></div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 italic text-[13px]">No employees found {searchQuery ? `matching "${searchQuery}"` : ''}</div>
              )
            )}
          </div>
        </div>
      )}

      {/* Projects */}
      {filterType === 'projects' && (
        <div className="bg-gradient-to-br from-white to-blue-50/50 p-8 rounded-xl shadow-md mb-8 border border-blue-500/10 max-md:p-5">
          <div className="flex items-center gap-4 mb-5">
            <button className="px-3.5 py-2 bg-gray-100 text-slate-800 border-none rounded-md text-xs font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-300" onClick={() => setFilterType(null)}>← Back</button>
            <h2 className="m-0 text-[22px] font-bold text-slate-800">📁 Projects Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-br from-gray-100 to-gray-200 border-b-[3px] border-b-blue-500">
                <tr>
                  {['Project Name', 'Owner', 'Status', 'Tasks', 'Completed', 'Progress'].map(h => (
                    <th key={h} className="p-4 text-left font-bold text-slate-800 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.length > 0 ? projects.map(project => {
                  const projectTasks = tasks.filter(t => t.project_id === project.id);
                  const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
                  const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
                  return (
                    <tr key={project.id} className="transition-all duration-200 hover:bg-blue-50">
                      <td className="px-4 py-3.5 border-b border-b-gray-100 text-sm text-slate-800 font-bold text-blue-500">{project.name}</td>
                      <td className="px-4 py-3.5 border-b border-b-gray-100 text-sm text-slate-800">{project.owner_name}</td>
                      <td className="px-4 py-3.5 border-b border-b-gray-100 text-sm"><span className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold capitalize ${project.status === 'active' ? 'bg-green-100 text-green-800' : project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{project.status}</span></td>
                      <td className="px-4 py-3.5 border-b border-b-gray-100 text-sm text-slate-800">{projectTasks.length}</td>
                      <td className="px-4 py-3.5 border-b border-b-gray-100 text-sm text-slate-800">{completedTasks}</td>
                      <td className="px-4 py-3.5 border-b border-b-gray-100 text-sm">
                        <div className="w-full h-6 bg-gray-100 rounded-xl overflow-hidden relative">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white transition-all duration-300 min-w-[30px]" style={{ width: `${progress}%` }}>{progress}%</div>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="6" className="text-center text-gray-400 italic p-8">No projects found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Health */}
      <div className="bg-gradient-to-br from-white to-blue-50/50 p-8 rounded-xl shadow-md mb-8 border border-blue-500/10 max-md:p-5">
        <h2 className="text-[22px] text-slate-800 m-0 mb-5 font-bold border-b-[3px] border-b-blue-500 pb-4">📊 System Health</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 max-xl:grid-cols-1">
          {[
            { title: 'User Distribution', items: [['Admins', stats.admins], ['Managers', stats.managers], ['Team Members', stats.teamMembers]], click: () => handleStatCardClick('admin') },
            { title: 'Project Status', items: [['Active', stats.activeProjects], ['Total', stats.totalProjects], ['Completion Rate', `${stats.taskCompletionRate}%`]], click: () => handleStatCardClick('projects') },
            { title: 'Task Statistics', items: [['Total Tasks', stats.totalTasks], ['Completed', stats.completedTasks], ['Pending', stats.totalTasks - stats.completedTasks]], click: null },
          ].map((card, i) => (
            <div key={i} className={`bg-gradient-to-br from-blue-50/50 to-white p-5 rounded-xl border-2 border-gray-100 transition-all duration-300 hover:border-blue-500 hover:shadow-md ${card.click ? 'cursor-pointer' : ''}`} onClick={card.click}>
              <h3 className="text-sm text-slate-800 m-0 mb-4 font-bold uppercase tracking-wider">{card.title}</h3>
              <div className="flex flex-col gap-2.5">
                {card.items.map(([label, value]) => (
                  <p key={label} className="m-0 text-[13px] text-gray-500 flex justify-between">{label}: <strong className="text-blue-500 font-bold">{value}</strong></p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <UserProfileModal userId={selectedEmployee?.id} isOpen={showEmployeeModal} onClose={() => setShowEmployeeModal(false)} onUpdate={fetchData} />
    </div>
  );
};

export default AdminDashboard;
