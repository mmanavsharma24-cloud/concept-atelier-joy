import React from 'react';
import { useDrop } from 'react-dnd';
import DraggableTaskCard from './DraggableTaskCard';

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
      className={`rounded-lg p-4 min-h-[500px] flex flex-col transition-all duration-300 border-2 ${
        isOver
          ? 'bg-blue-100 border-blue-400 shadow-[0_0_10px_rgba(52,152,219,0.3)]'
          : 'bg-gray-200 border-transparent'
      }`}
    >
      <div className="flex justify-between items-center mb-4 pb-2.5 border-b-2 border-gray-300">
        <h3 className="m-0 text-lg text-gray-800">{statusLabel}</h3>
        <span className="bg-gray-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {tasks.map(task => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            users={users}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex justify-center items-center h-[100px] text-gray-400 italic border-2 border-dashed border-gray-300 rounded bg-white/50">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

export default DroppableColumn;
