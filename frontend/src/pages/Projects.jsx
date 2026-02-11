import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { projectService, userService, attachmentService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/modals/Modal';
import ProjectForm from '../components/modals/ProjectForm';
import ProjectAttachments from '../components/modals/ProjectAttachments';
import PermissionGuard from '../components/common/PermissionGuard';
import { usePermission } from '../hooks/usePermission';
import { handleAPIError, showError, showSuccess } from '../utils/errorHandler';

const statusColors = { active: 'bg-green-100 text-green-800', in_progress: 'bg-yellow-100 text-yellow-800', planning: 'bg-blue-100 text-blue-800' };

const Projects = () => {
  const { user } = useAuth();
  const { can } = usePermission();
  const location = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [projectTasks, setProjectTasks] = useState([]);

  useEffect(() => { fetchData(); if (location.state?.openCreateModal) setShowModal(true); }, [location]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let projectsData;
      if (user?.role === 'user') { projectsData = await projectService.getUserAnalytics(); }
      else { projectsData = await projectService.getAll(); }
      const usersData = await userService.getAll();
      setProjects(projectsData);
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load projects');
      showError(message);
      setLoading(false);
    }
  };

  const handleCreateProject = () => { window.open('/projects/create', '_blank'); };
  const handleEditProject = (project) => { setEditingProject(project); setShowModal(true); };
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try { await projectService.delete(projectId); setProjects(projects.filter(p => p.id !== projectId)); setShowProjectDetails(false); setSelectedProjectForDetails(null); showSuccess('Project deleted successfully'); }
      catch (error) { const { message } = handleAPIError(error, 'Failed to delete project'); showError(message); }
    }
  };
  const handleProjectCardClick = (project) => { navigate(`/projects/${project.id}`); };
  const handleSubmitProject = async (formData) => {
    try {
      const files = formData.files || [];
      const { files: _, ...projectData } = formData;
      if (editingProject) {
        await projectService.update(editingProject.id, projectData);
        const updatedProject = { ...editingProject, ...projectData };
        setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
        setSelectedProjectForDetails(updatedProject);
        showSuccess('Project updated successfully');
      } else {
        const newProject = await projectService.create(projectData);
        if (files.length > 0) { for (const file of files) { try { await attachmentService.uploadProject(newProject.id, file); } catch (error) { console.error('Error uploading file:', error); showError(`Failed to upload ${file.name}`); } } }
        setProjects([...projects, newProject]);
        showSuccess('Project created successfully');
      }
      setShowModal(false);
      setEditingProject(null);
    } catch (error) { const { message } = handleAPIError(error, 'Failed to save project'); showError(message); }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-lg text-gray-500">Loading projects...</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen max-md:p-5 max-sm:p-4">
      <div className="flex justify-between items-center mb-8 max-md:flex-col max-md:items-start max-md:gap-4">
        <h1 className="m-0 text-3xl text-slate-800 max-md:text-2xl max-sm:text-xl">Projects</h1>
        <PermissionGuard resource="projects" action="create">
          <button className="py-2.5 px-5 bg-blue-500 text-white border-none rounded text-sm font-bold cursor-pointer transition-colors hover:bg-blue-600 max-sm:w-full max-sm:py-2.5" onClick={handleCreateProject}>+ New Project</button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-lg p-5 shadow transition-all cursor-pointer min-h-[120px] flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 hover:bg-blue-50/50 max-md:p-4 max-sm:p-3" onClick={() => handleProjectCardClick(project)}>
            <div className="flex justify-between items-start mb-4 gap-2.5">
              <h3 className="m-0 text-lg text-slate-800 flex-1 font-semibold max-md:text-base max-sm:text-sm">{project.name}</h3>
              <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold uppercase whitespace-nowrap ${statusColors[project.status] || ''}`}>{project.status}</span>
            </div>
            <div className="text-[13px] text-gray-500 mt-auto">
              <small>👤 {project.owner_name}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Project Create/Edit Drawer */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[999] animate-[fadeIn_0.3s_ease-in-out]" onClick={() => { setShowModal(false); setEditingProject(null); }} />
          <div className="fixed top-0 right-0 w-[450px] h-screen bg-white shadow-[-2px_0_8px_rgba(0,0,0,0.15)] z-[1000] flex flex-col animate-[slideInRight_0.3s_ease-in-out] max-md:w-full">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
              <h2 className="m-0 text-xl text-slate-800 font-bold">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
              <button className="bg-transparent border-none text-2xl text-gray-500 cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded transition-all hover:bg-gray-200 hover:text-slate-800" onClick={() => { setShowModal(false); setEditingProject(null); }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <ProjectForm project={editingProject} users={users} onSubmit={handleSubmitProject} onCancel={() => { setShowModal(false); setEditingProject(null); }} />
            </div>
          </div>
        </>
      )}

      {showProjectDetails && selectedProjectForDetails && (
        <Modal isOpen={showProjectDetails} title="Project Details" onClose={() => { setShowProjectDetails(false); setSelectedProjectForDetails(null); }} size="large" hideCloseButton={true}>
          <div className="p-0 flex flex-col w-full h-full">
            <div className="grid grid-cols-2 gap-5 p-6 w-full content-start max-lg:grid-cols-1">
              <div className="flex flex-col gap-4 pr-4 border-r border-gray-200 max-lg:pr-0 max-lg:border-r-0 max-lg:border-b max-lg:border-gray-200 max-lg:pb-5">
                <div className="flex flex-col gap-3">
                  <h3 className="m-0 text-2xl text-slate-800 font-bold leading-snug break-words max-md:text-xl">{selectedProjectForDetails.name}</h3>
                  <p className="m-0 text-sm text-gray-500 leading-relaxed">{selectedProjectForDetails.description || 'No description'}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Owner:</label><span className="text-sm text-slate-800 font-medium">{selectedProjectForDetails.owner_name}</span></div>
                  <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status:</label><span className={`inline-block self-start px-2 py-1 rounded text-[11px] font-bold uppercase ${statusColors[selectedProjectForDetails.status] || ''}`}>{selectedProjectForDetails.status}</span></div>
                  {selectedProjectForDetails.start_date && <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Start Date:</label><span className="text-sm text-slate-800 font-medium">{new Date(selectedProjectForDetails.start_date).toLocaleDateString()}</span></div>}
                  {selectedProjectForDetails.end_date && <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">End Date:</label><span className="text-sm text-slate-800 font-medium">{new Date(selectedProjectForDetails.end_date).toLocaleDateString()}</span></div>}
                </div>
                <div className="flex flex-col gap-2.5 pt-5 border-t border-gray-200 mt-auto max-md:flex-row max-md:gap-2">
                  <PermissionGuard resource="projects" action="update"><button className="py-2.5 px-4 bg-blue-500 text-white border-none rounded text-[13px] font-semibold cursor-pointer transition-colors hover:bg-blue-600 max-md:flex-1" onClick={() => { handleEditProject(selectedProjectForDetails); setShowProjectDetails(false); }}>Edit</button></PermissionGuard>
                  <PermissionGuard resource="projects" action="delete"><button className="py-2.5 px-4 bg-red-500 text-white border-none rounded text-[13px] font-semibold cursor-pointer transition-colors hover:bg-red-600 max-md:flex-1" onClick={() => handleDeleteProject(selectedProjectForDetails.id)}>Delete</button></PermissionGuard>
                  <button className="py-2.5 px-4 bg-gray-200 text-slate-800 border-none rounded text-[13px] font-semibold cursor-pointer transition-colors hover:bg-gray-300 max-md:flex-1" onClick={() => { setShowProjectDetails(false); setSelectedProjectForDetails(null); }}>Close</button>
                </div>
              </div>
              <div className="flex flex-col pl-4 max-lg:pl-0">
                <ProjectAttachments projectId={selectedProjectForDetails.id} canEdit={can('projects', 'update')} onAttachmentChange={() => { const updatedProject = projects.find(p => p.id === selectedProjectForDetails.id); if (updatedProject) setSelectedProjectForDetails(updatedProject); }} />
              </div>
              <div className="mt-5 pt-5 border-t border-gray-200 col-span-full">
                <h3 className="m-0 mb-5 text-lg text-slate-800 font-bold">Project Tasks</h3>
                <div className="flex flex-col gap-3">
                  {projectTasks.length > 0 ? projectTasks.map(task => (
                    <div key={task.id} className="bg-gray-50 border border-gray-200 rounded-md p-4 transition-all hover:bg-gray-100 hover:border-gray-400 hover:shadow">
                      <div className="flex justify-between items-start mb-2 gap-2.5"><h4 className="m-0 text-sm text-slate-800 font-semibold flex-1">{task.title}</h4><span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase whitespace-nowrap ${statusColors[task.status] || ''}`}>{task.status}</span></div>
                      <p className="m-0 mb-2.5 text-[13px] text-gray-500 leading-snug">{task.description || 'No description'}</p>
                      <div className="flex gap-3 flex-wrap">
                        {task.assigned_to_name && <span className="text-xs text-gray-500 flex items-center gap-1">👤 {task.assigned_to_name}</span>}
                        {task.priority && <span className={`text-xs font-semibold ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>⚡ {task.priority}</span>}
                        {task.due_date && <span className="text-xs text-gray-500">📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  )) : <p className="text-center text-gray-400 text-sm p-5 bg-gray-50 rounded-md">No tasks in this project yet</p>}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Projects;
