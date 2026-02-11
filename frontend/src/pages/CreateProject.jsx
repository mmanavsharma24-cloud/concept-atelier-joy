import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService, userService, attachmentService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ProjectForm from '../components/modals/ProjectForm';
import { handleAPIError, showError, showSuccess } from '../utils/errorHandler';


const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await userService.getAll();
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load users');
      showError(message);
      setLoading(false);
    }
  };

  const handleSubmitProject = async (formData) => {
    try {
      const files = formData.files || [];
      const { files: _, ...projectData } = formData;

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
      
      showSuccess('Project created successfully');
      navigate('/projects');
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to create project');
      showError(message);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  const handleBack = () => {
    navigate('/projects');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="create-project-full-page">
      <div className="create-project-top-bar">
        <button className="back-button" onClick={handleBack}>
          ← Back to Projects
        </button>
      </div>

      <div className="create-project-main">
        <div className="create-project-form-wrapper">
          <h1>Create New Project</h1>
          <ProjectForm
            project={null}
            users={users}
            onSubmit={handleSubmitProject}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
