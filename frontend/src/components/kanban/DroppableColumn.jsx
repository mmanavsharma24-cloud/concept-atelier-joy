import React from 'react';
import { useDrop } from 'react-dnd';
import DraggableTaskCard from './DraggableTaskCard';
import '../../styles/DroppableColumn.css';

const DroppableColumn = ({ status, statusLabel, tasks, users, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item) => {
      onDrop(item.task.id, status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`droppable-column ${isOver ? 'over' : ''}`}
    >
      <div className="column-header">
        <h3>{statusLabel}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div className="tasks-container">
        {tasks.map(task => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            users={users}
          />
        ))}
        {tasks.length === 0 && (
          <div className="empty-state">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

export default DroppableColumn;
