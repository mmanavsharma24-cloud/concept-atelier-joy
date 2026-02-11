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
import '../styles/Projects.css';

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

  useEffect(() => {
    fetchData();
    // Open create modal if navigated from sidebar
    if (location.state?.openCreateModal) {
      setShowModal(true);
    }
  }, [location]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // For admin and manager: fetch all data
      // For regular users: fetch only their projects
      let projectsData;
      
      if (user?.role === 'user') {
        projectsData = await projectService.getUserAnalytics();
      } else {
        projectsData = await projectService.getAll();
      }
      
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

  const handleCreateProject = () => {
    window.open('/projects/create', '_blank');
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.delete(projectId);
        setProjects(projects.filter(p => p.id !== projectId));
        setShowProjectDetails(false);
        setSelectedProjectForDetails(null);
        showSuccess('Project deleted successfully');
      } catch (error) {
        const { message } = handleAPIError(error, 'Failed to delete project');
        showError(message);
      }
    }
  };

  const handleProjectCardClick = (project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleSubmitProject = async (formData) => {
    try {
      const files = formData.files || [];
      const { files: _, ...projectData } = formData; // Remove files from project data

      if (editingProject) {
        await projectService.update(editingProject.id, projectData);
        const updatedProject = { ...editingProject, ...projectData };
        setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
        setSelectedProjectForDetails(updatedProject);
        showSuccess('Project updated successfully');
      } else {
        const newProject = await projectService.create(projectData);
        
        // Upload files if any
        if (files.length > 0) {
          for (const file of files) {
            try {
              await attachmentService.uploadProject(newProject.id, file);
            } catch (error) {
              console.error('Error uploading file:', error);
              showError(`Failed to upload ${file.name}`);
            }
          }
        }
        
        setProjects([...projects, newProject]);
        showSuccess('Project created successfully');
      }
      setShowModal(false);
      setEditingProject(null);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to save project');
      showError(message);
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects</h1>
        <PermissionGuard resource="projects" action="create">
          <button className="btn-primary" onClick={handleCreateProject}>+ New Project</button>
        </PermissionGuard>
      </div>

      <div className="projects-grid">
        {projects.map(project => (
          <div 
            key={project.id} 
            className="project-card"
            onClick={() => handleProjectCardClick(project)}
          >
            <div className="project-card-header">
              <h3>{project.name}</h3>
              <span className={`status-badge status-${project.status}`}>{project.status}</span>
            </div>
            
            <div className="project-owner-simple">
              <small>👤 {project.owner_name}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Project Create/Edit Drawer */}
      {showModal && (
        <>
          {/* Overlay */}
          <div 
            className="drawer-overlay"
            onClick={() => {
              setShowModal(false);
              setEditingProject(null);
            }}
          />
          
          {/* Drawer Panel */}
          <div className="project-drawer">
            <div className="drawer-header">
              <h2>{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
              <button
                className="drawer-close-btn"
                onClick={() => {
                  setShowModal(false);
                  setEditingProject(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="drawer-content">
              <ProjectForm
                project={editingProject}
                users={users}
                onSubmit={handleSubmitProject}
                onCancel={() => {
                  setShowModal(false);
                  setEditingProject(null);
                }}
              />
            </div>
          </div>
        </>
      )}

      {showProjectDetails && selectedProjectForDetails && (
        <Modal
          isOpen={showProjectDetails}
          title="Project Details"
          onClose={() => {
            setShowProjectDetails(false);
            setSelectedProjectForDetails(null);
          }}
          size="large"
          hideCloseButton={true}
        >
          <div className="project-details-modal">
            <div className="project-details-container">
              {/* Left Column - Project Info */}
              <div className="project-info-column">
                <div className="project-info-section">
                  <h3 className="project-title">{selectedProjectForDetails.name}</h3>
                  <p className="project-description">
                    {selectedProjectForDetails.description || 'No description'}
                  </p>
                </div>

                <div className="project-info-details">
                  <div className="info-item">
                    <label>Owner:</label>
                    <span>{selectedProjectForDetails.owner_name}</span>
                  </div>

                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status-badge status-${selectedProjectForDetails.status}`}>
                      {selectedProjectForDetails.status}
                    </span>
                  </div>

                  {selectedProjectForDetails.start_date && (
                    <div className="info-item">
                      <label>Start Date:</label>
                      <span>{new Date(selectedProjectForDetails.start_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  {selectedProjectForDetails.end_date && (
                    <div className="info-item">
                      <label>End Date:</label>
                      <span>{new Date(selectedProjectForDetails.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="project-actions">
                  <PermissionGuard resource="projects" action="update">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        handleEditProject(selectedProjectForDetails);
                        setShowProjectDetails(false);
                      }}
                    >
                      Edit
                    </button>
                  </PermissionGuard>

                  <PermissionGuard resource="projects" action="delete">
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteProject(selectedProjectForDetails.id)}
                    >
                      Delete
                    </button>
                  </PermissionGuard>

                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setShowProjectDetails(false);
                      setSelectedProjectForDetails(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Right Column - Attachments */}
              <div className="project-attachments-column">
                <ProjectAttachments 
                  projectId={selectedProjectForDetails.id}
                  canEdit={can('projects', 'update')}
                  onAttachmentChange={() => {
                    // Refresh the project details when attachment is added/deleted
                    const updatedProject = projects.find(p => p.id === selectedProjectForDetails.id);
                    if (updatedProject) {
                      setSelectedProjectForDetails(updatedProject);
                    }
                  }}
                />
              </div>

              {/* Tasks Section */}
              <div className="project-tasks-section">
                <h3>Project Tasks</h3>
                <div className="tasks-list">
                  {projectTasks.length > 0 ? (
                    projectTasks.map(task => (
                      <div key={task.id} className="task-item">
                        <div className="task-header">
                          <h4>{task.title}</h4>
                          <span className={`task-status status-${task.status}`}>{task.status}</span>
                        </div>
                        <p className="task-description">{task.description || 'No description'}</p>
                        <div className="task-meta">
                          {task.assigned_to_name && (
                            <span className="meta-item">👤 {task.assigned_to_name}</span>
                          )}
                          {task.priority && (
                            <span className={`meta-item priority-${task.priority}`}>⚡ {task.priority}</span>
                          )}
                          {task.due_date && (
                            <span className="meta-item">📅 {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-tasks">No tasks in this project yet</p>
                  )}
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
