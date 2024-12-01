import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" >
      <div className="relative w-full max-w-lg p-6 bg-white rounded-lg">
        <button
          className="absolute top-4 right-6 text-gray-500 hover:text-gray-800 text-[30px]"
          onClick={onClose}  
        >
          &times;
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;
