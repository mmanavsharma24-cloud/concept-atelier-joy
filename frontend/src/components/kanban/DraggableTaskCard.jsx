import React from 'react';
import { useDrag } from 'react-dnd';

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
      className={`bg-white rounded-md p-3 shadow-sm cursor-grab transition-all duration-200 border-l-4 border-l-blue-600 mb-2.5 hover:shadow-md hover:-translate-y-0.5 ${
        isDragging ? 'opacity-50 cursor-grabbing shadow-lg rotate-2' : ''
      }`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h4 className="m-0 text-sm text-gray-800 flex-1 break-words">{task.title}</h4>
        <span 
          className="px-2 py-0.5 rounded text-white text-[11px] font-bold whitespace-nowrap uppercase"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        >
          {task.priority}
        </span>
      </div>
      
      <p className="text-xs text-gray-500 my-2 leading-relaxed line-clamp-2">{task.description}</p>
      
      <div className="flex justify-between items-center text-[11px] gap-2">
        <div className="flex-1">
          {assignedUser ? (
            <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
              {assignedUser.full_name}
            </span>
          ) : (
            <span className="text-gray-400 italic">Unassigned</span>
          )}
        </div>
        
        {task.due_date && (
          <span className="text-orange-600 font-bold">
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default DraggableTaskCard;
