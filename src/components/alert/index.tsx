import React from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose, className }) => {
  const getAlertColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'info':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return '';
    }
  };

  return (
    <div
      className={`fixed top-[50px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center p-4 text-sm border rounded-lg shadow-lg z-50 ${getAlertColor()}`}
      role="alert"
    >
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-lg font-semibold leading-none focus:outline-none"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
