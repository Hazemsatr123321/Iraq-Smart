
import React from 'react';
import { Toast as ToastComponent } from './common/Toast';
import type { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
  setToasts: React.Dispatch<React.SetStateAction<Toast[]>>;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, setToasts }) => {
  const removeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-5 right-5 z-[100] space-y-3">
      {toasts.map(toast => (
        <ToastComponent
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
