import React, { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg p-6 bg-white rounded-lg"
                onClick={(e) => e.stopPropagation()}
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
