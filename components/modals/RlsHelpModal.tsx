
import React, { useState } from 'react';
import { Button } from '../common/Button';
import { AlertTriangleIcon } from '../icons/AlertTriangleIcon';
import { CopyIcon } from '../icons/CopyIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { DatabaseIcon } from '../icons/DatabaseIcon';

interface RlsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  sqlScript: string;
}

export const RlsHelpModal: React.FC<RlsHelpModalProps> = ({ isOpen, onClose, sqlScript }) => {
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
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-3xl p-6 border border-red-500/50" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <DatabaseIcon className="w-8 h-8 text-red-500"/>
          <h2 className="text-2xl font-bold text-red-400">مطلوب إعداد قاعدة البيانات</h2>
        </div>
        <p className="text-brand-text-secondary mb-4">
          أهلاً بك! يبدو أن هذه هي المرة الأولى التي تقوم فيها بتشغيل التطبيق مع مشروع Supabase هذا. قاعدة البيانات الخاصة بك فارغة حالياً وتحتاج إلى تهيئة.
        </p>
        <p className="text-brand-text-secondary mb-4">
          لحل هذه المشكلة، يرجى نسخ السكربت الكامل التالي وتنفيذه في قسم <code className="bg-gray-700 p-1 rounded text-yellow-300">SQL Editor</code> في لوحة تحكم مشروعك على Supabase. سيقوم هذا السكربت بإنشاء جميع الجداول، الصلاحيات، والبيانات الأولية المطلوبة لتشغيل التطبيق.
        </p>

        <div className="relative bg-black/50 p-4 rounded-lg my-4 max-h-80 overflow-y-auto">
          <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
            <code>{sqlScript}</code>
          </pre>
          <button onClick={handleCopy} className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md z-10">
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="secondary" className="w-full">
                    فتح لوحة تحكم Supabase
                </Button>
            </a>
            <Button onClick={onClose} className="w-full">
                حسناً، سأنفذ السكربت
            </Button>
        </div>
      </div>
    </div>
  );
};
