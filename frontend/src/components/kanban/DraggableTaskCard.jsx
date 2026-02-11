import React from 'react';
import { useDrag } from 'react-dnd';
import '../../styles/DraggableTaskCard.css';

const DraggableTaskCard = ({ task, users }) => {
  const assignedUser = users.find(u => u.id === task.assigned_to);
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id, task },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`draggable-task-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="task-header">
        <h4>{task.title}</h4>
        <span 
          className="priority-badge" 
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        >
          {task.priority}
        </span>
      </div>
      
      <p className="task-description">{task.description}</p>
      
      <div className="task-footer">
        <div className="task-assignee">
          {assignedUser ? (
            <span className="assignee-name">{assignedUser.full_name}</span>
          ) : (
            <span className="unassigned">Unassigned</span>
          )}
        </div>
        
        {task.due_date && (
          <span className="due-date">{new Date(task.due_date).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

export default DraggableTaskCard;
