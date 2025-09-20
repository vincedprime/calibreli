import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export function Toast({ 
  message, 
  type = ToastTypes.INFO, 
  duration = 5000, 
  onClose,
  isVisible = true 
}) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose?.(), 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getIcon = () => {
    switch (type) {
      case ToastTypes.SUCCESS:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case ToastTypes.ERROR:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case ToastTypes.WARNING:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case ToastTypes.INFO:
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "flex items-center gap-3 p-4 rounded-lg shadow-lg border max-w-sm";
    
    switch (type) {
      case ToastTypes.SUCCESS:
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case ToastTypes.ERROR:
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case ToastTypes.WARNING:
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case ToastTypes.INFO:
      default:
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  if (!show) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out
      ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={getStyles()}>
        {getIcon()}
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button
          onClick={handleClose}
          className="hover:bg-black hover:bg-opacity-10 rounded p-1 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

export { ToastTypes };
