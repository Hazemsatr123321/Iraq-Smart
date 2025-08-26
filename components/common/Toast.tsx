
import React, { useEffect, useState } from 'react';
import type { ToastType } from '../../types';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { XIcon } from '../icons/XIcon';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
    style: 'bg-green-900/70 border-green-600/50',
  },
  error: {
    icon: <XCircleIcon className="w-6 h-6 text-red-400" />,
    style: 'bg-red-900/70 border-red-600/50',
  },
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4000); // Auto-close after 4 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const config = toastConfig[type];

  return (
    <div
      className={`flex items-center gap-4 w-full max-w-sm p-4 text-white ${config.style} rounded-lg shadow-lg backdrop-blur-md border animate-slideIn ${isExiting ? 'animate-fadeOut' : ''}`}
      role="alert"
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <div className="flex-grow text-sm font-semibold">{message}</div>
      <button
        onClick={handleClose}
        className="p-1 rounded-full hover:bg-white/10 transition-colors"
        aria-label="إغلاق"
      >
        <XIcon className="w-4 h-4" />
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
        .animate-fadeOut { animation: fadeOut 0.3s ease-in forwards; }
      `}</style>
    </div>
  );
};
