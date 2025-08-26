import React, { useState } from 'react';
import { Button } from '../common/Button';
import { AlertTriangleIcon } from '../icons/AlertTriangleIcon';
import { CopyIcon } from '../icons/CopyIcon';
import { CheckIcon } from '../icons/CheckIcon';

interface UserRlsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  sqlScript: string;
}

export const UserRlsHelpModal: React.FC<UserRlsHelpModalProps> = ({ isOpen, onClose, sqlScript }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[202] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-2xl p-6 border border-red-500/50" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangleIcon className="w-8 h-8 text-red-500"/>
          <h2 className="text-2xl font-bold text-red-400">خطأ في صلاحيات قراءة بيانات المستخدمين (RLS)</h2>
        </div>
        <p className="text-brand-text-secondary mb-4">
          حدث خطأ شائع عند محاولة جلب بيانات المستخدمين. هذا بسبب أن سياسات الأمان (RLS) لجدول <code className="bg-gray-700 p-1 rounded text-yellow-300">users</code> في قاعدة بيانات Supabase الخاصة بك لم يتم إعدادها.
        </p>
        <p className="text-brand-text-secondary mb-4">
          لإصلاح هذا، يرجى نسخ كود الـ SQL التالي وتنفيذه في قسم <code className="bg-gray-700 p-1 rounded text-yellow-300">SQL Editor</code> في لوحة تحكم Supabase.
        </p>

        <div className="relative bg-black/50 p-4 rounded-lg my-4">
          <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
            <code>{sqlScript}</code>
          </pre>
          <button onClick={handleCopy} className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md">
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="secondary">فهمت، سأقوم بإصلاحها</Button>
        </div>
      </div>
    </div>
  );
};