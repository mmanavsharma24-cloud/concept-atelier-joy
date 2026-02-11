import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { projectService, userService } from '../services/api';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { handleAPIError, showError } from '../utils/errorHandler';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projectsData = await projectService.getAll();
      const usersData = await userService.getAll();
      setProjects(projectsData);
      setUsers(usersData);
      if (projectsData.length > 0) setSelectedProject(projectsData[0].id);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load dashboard');
      showError(message);
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-lg text-gray-500">Loading...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-5 shadow flex justify-between items-center gap-5 max-md:flex-col max-md:items-start max-md:gap-4 max-md:p-4 max-sm:p-3 max-sm:gap-2.5">
          <h1 className="m-0 text-3xl flex-1 max-md:text-[22px] max-sm:text-lg">ProSafe Work Management</h1>
          <div className="flex items-center gap-2.5 max-md:w-full max-md:flex-col max-md:items-start">
            <label htmlFor="project-select" className="font-bold whitespace-nowrap max-sm:text-xs">Select Project:</label>
            <select
              id="project-select"
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(Number(e.target.value))}
              className="py-2 px-3 border-none rounded text-sm cursor-pointer bg-white text-gray-800 min-w-[200px] focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,255,255,0.3)] max-md:w-full max-md:min-w-0 max-sm:text-xs max-sm:py-1.5 max-sm:px-2.5"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </header>

        {selectedProject && <KanbanBoard projectId={selectedProject} users={users} />}
      </div>
    </DndProvider>
  );
};

export default Dashboard;
