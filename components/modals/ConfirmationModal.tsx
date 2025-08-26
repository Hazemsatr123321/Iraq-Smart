import React from 'react';
import { Button } from '../common/Button';
import { AlertTriangleIcon } from '../icons/AlertTriangleIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[202] flex items-center justify-center p-4 animate-fadeInUp" style={{animationDuration: '0.3s'}} onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-md p-6 border border-brand-secondary" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <AlertTriangleIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-brand-text-secondary mt-2 mb-6">{message}</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={onConfirm} className="w-full !bg-red-600 hover:!bg-red-700">تأكيد</Button>
          <Button onClick={onClose} variant="secondary" className="w-full">إلغاء</Button>
        </div>
      </div>
    </div>
  );
};
