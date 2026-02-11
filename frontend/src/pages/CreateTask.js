import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService, userService, attachmentService } from '../services/api';
import TaskForm from '../components/modals/TaskForm';
import { handleAPIError, showError, showSuccess } from '../utils/errorHandler';
import '../styles/Projects.css';

const CreateTask = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getAll();
      const projectsData = await projectService.getAll();
      setUsers(usersData);
      setProjects(projectsData);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load data');
      showError(message);
      setLoading(false);
    }
  };

  const handleSubmitTask = async (formData) => {
    try {
      const files = formData.files || [];
      const { files: _, ...taskData } = formData;

      const newTask = await projectService.createTask(taskData);
      
      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          try {
            await attachmentService.upload(newTask.id, file);
          } catch (error) {
            console.error('Error uploading file:', error);
            showError(`Failed to upload ${file.name}`);
          }
        }
      }

      showSuccess('Task created successfully');
      window.close();
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to create task');
      showError(message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="create-project-full-page">
      <div className="create-project-top-bar">
        <button className="back-button" onClick={() => window.close()}>
          ← Back to Tasks
        </button>
      </div>

      <div className="create-project-main">
        <div className="create-project-form-wrapper">
          <h1>Create New Task</h1>
          <TaskForm
            users={users}
            projects={projects}
            onSubmit={handleSubmitTask}
            onCancel={() => window.close()}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
