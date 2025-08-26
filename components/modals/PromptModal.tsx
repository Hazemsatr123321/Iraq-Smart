import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { InfoIcon } from '../icons/InfoIcon';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
}

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(value);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[202] flex items-center justify-center p-4 animate-fadeInUp" style={{animationDuration: '0.3s'}} onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-md p-6 border border-brand-secondary" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <InfoIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-brand-text-secondary mt-2 mb-6">{message}</p>
        </div>
        <Input 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full"
            autoFocus
        />
        <div className="mt-6 flex gap-4">
          <Button onClick={handleConfirm} className="w-full">تأكيد</Button>
          <Button onClick={onClose} variant="secondary" className="w-full">إلغاء</Button>
        </div>
      </div>
    </div>
  );
};
