import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService, projectService, userService, attachmentService } from '../services/api';
import TaskForm from '../components/modals/TaskForm';
import { handleAPIError, showError, showSuccess } from '../utils/errorHandler';
import '../styles/Projects.css';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const taskData = await taskService.getById(id);
      const usersData = await userService.getAll();
      const projectsData = await projectService.getAll();
      setTask(taskData);
      setUsers(usersData);
      setProjects(projectsData);
      setLoading(false);
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to load task');
      showError(message);
      setLoading(false);
    }
  };

  const handleSubmitTask = async (formData) => {
    try {
      const files = formData.files || [];
      const { files: _, ...taskData } = formData;

      await taskService.update(id, taskData);
      
      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          try {
            await attachmentService.upload(id, file);
          } catch (error) {
            console.error('Error uploading file:', error);
            showError(`Failed to upload ${file.name}`);
          }
        }
      }

      showSuccess('Task updated successfully');
      window.close();
    } catch (error) {
      const { message } = handleAPIError(error, 'Failed to update task');
      showError(message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!task) return <div className="loading">Task not found</div>;

  return (
    <div className="create-project-full-page">
      <div className="create-project-top-bar">
        <button className="back-button" onClick={() => window.close()}>
          ← Back to Tasks
        </button>
      </div>

      <div className="create-project-main">
        <div className="create-project-form-wrapper">
          <h1>Edit Task</h1>
          <TaskForm
            task={task}
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

export default EditTask;
