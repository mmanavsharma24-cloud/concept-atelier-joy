import React from 'react';

const Modal = ({ isOpen, title, children, onClose, size = 'medium', hideCloseButton = false }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-[400px]',
    medium: 'max-w-[600px]',
    large: 'max-w-[1000px]',
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] overflow-hidden"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] w-[90%] max-h-[95vh] overflow-hidden transition-all duration-300 flex flex-col z-[1001] ${sizeClasses[size] || sizeClasses.medium}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b-2 border-gray-100 bg-gradient-to-br from-slate-50 to-white gap-5 shrink-0 min-h-[70px] w-full box-border">
          <h2 className="m-0 text-xl text-slate-800 font-bold flex-1 break-words min-w-0">{title}</h2>
          {!hideCloseButton && (
            <button
              className="bg-transparent border-none text-2xl text-gray-400 cursor-pointer transition-all duration-300 w-8 h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md shrink-0 p-0 hover:text-slate-800 hover:bg-gray-100"
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </div>
        <div className="p-0 flex-1 overflow-y-auto flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
