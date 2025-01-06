import React, { ReactNode, useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const [isVisible, setIsVisible] = useState(false);  
  const [renderModal, setRenderModal] = useState(false);  

  useEffect(() => {
    if (isOpen) {
      setRenderModal(true);  
      setTimeout(() => setIsVisible(true), 10);  
    } else {
      setIsVisible(false);  
      const timeout = setTimeout(() => setRenderModal(false), 300);  
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!renderModal) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative w-full max-w-lg p-6 bg-white rounded-lg transform transition-transform duration-300 ${
          isVisible ? "translate-y-0 scale-100" : "translate-y-10 scale-95"
        }`}
      >
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