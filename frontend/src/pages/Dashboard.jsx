import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { projectService, userService } from '../services/api';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { handleAPIError, showError } from '../utils/errorHandler';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projectsData = await projectService.getAll();
      const usersData = await userService.getAll();
      console.log('Projects fetched:', projectsData);
      console.log('Users fetched:', usersData);
      setProjects(projectsData);
      setUsers(usersData);
      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load dashboard');
      showError(message);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>ProSafe Work Management</h1>
          <div className="project-selector">
            <label htmlFor="project-select">Select Project:</label>
            <select
              id="project-select"
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(Number(e.target.value))}
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {selectedProject && (
          <KanbanBoard projectId={selectedProject} users={users} />
        )}
      </div>
    </DndProvider>
  );
};

export default Dashboard;
