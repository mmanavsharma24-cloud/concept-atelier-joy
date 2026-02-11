import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Home from '../../pages/Home';
import Projects from '../../pages/Projects';
import ProjectDetails from '../../pages/ProjectDetails';
import CreateProject from '../../pages/CreateProject';
import Tasks from '../../pages/Tasks';
import TaskDetails from '../../pages/TaskDetails';
import Dashboard from '../../pages/Dashboard';
import Analytics from '../../pages/Analytics';
import Inbox from '../../pages/Inbox';
import AdminDashboard from '../../pages/AdminDashboard';
import ManagerDashboard from '../../pages/ManagerDashboard';
import UserProfile from '../../pages/UserProfile';
import { useAuth } from '../../hooks/useAuth';

function MainLayout() {
  const location = useLocation();
  const { user } = useAuth();
  
  const getActiveMenu = () => {
    const path = location.pathname;
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/manager')) return 'manager';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/inbox')) return 'inbox';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/projects')) return 'projects';
    if (path.includes('/tasks')) return 'tasks';
    if (path.includes('/my-tasks')) return 'my-tasks';
    if (path.includes('/dashboard')) return 'dashboard';
    return 'home';
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  
  // Check if we're on a project details page (has /projects/:id pattern)
  const isProjectDetailsPage = /^\/projects\/\d+$/.test(location.pathname);
  
  // Check if we're on a task details page (has /tasks/:id pattern)
  const isTaskDetailsPage = /^\/tasks\/\d+$/.test(location.pathname);
  
  // Check if we're on a create project page
  const isCreateProjectPage = location.pathname === '/projects/create';
  
  // Hide sidebar for project details, task details, and create project pages
  const hideSidebar = isProjectDetailsPage || isTaskDetailsPage || isCreateProjectPage;

  return (
    <div className="App">
      {!hideSidebar && <Sidebar activeMenu={getActiveMenu()} />}
      <div className={`main-content ${hideSidebar ? 'fullscreen-mode' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/my-tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/projects/create" element={<CreateProject />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
          {isManager && <Route path="/manager" element={<ManagerDashboard />} />}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}

export default MainLayout;
