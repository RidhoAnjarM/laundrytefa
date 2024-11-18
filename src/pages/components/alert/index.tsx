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
      className={`flex items-center p-4 mb-4 text-sm border rounded-lg w-[500px] absolute ${getAlertColor()}`}
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
