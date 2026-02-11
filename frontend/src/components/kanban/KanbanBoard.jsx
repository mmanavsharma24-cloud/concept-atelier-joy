import React, { useState, useEffect } from 'react';
import { taskService } from '../../services/api';
import DroppableColumn from './DroppableColumn';

const KanbanBoard = ({ projectId, users }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getByProject(projectId);
      console.log(`Tasks fetched for project ${projectId}:`, data);
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const handleDrop = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      try {
        await taskService.update(taskId, { ...task, status: newStatus });
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, status: newStatus } : t
        ));
        console.log(`Task ${taskId} moved to ${newStatus}`);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-lg text-gray-500">Loading tasks...</div>;

  const statuses = ['pending', 'in_progress', 'completed'];
  const statusLabels = {
    pending: 'To Do',
    in_progress: 'In Progress',
    completed: 'Done'
  };

  return (
    <div className="grid grid-cols-3 gap-5 p-5 bg-gray-100 min-h-screen overflow-x-auto max-lg:grid-cols-2 max-md:grid-cols-1">
      {statuses.map(status => (
        <DroppableColumn
          key={status}
          status={status}
          statusLabel={statusLabels[status]}
          tasks={getTasksByStatus(status)}
          users={users}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
