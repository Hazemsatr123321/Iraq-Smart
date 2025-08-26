import React, { useState } from 'react';
import { Button } from '../common/Button';
import { UploadIcon } from '../icons/UploadIcon';

interface RaiseDisputeModalProps {
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export const RaiseDisputeModal: React.FC<RaiseDisputeModalProps> = ({ onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 20) {
      setError('الرجاء كتابة سبب مفصل للنزاع (20 حرفاً على الأقل).');
      return;
    }
    setError('');
    onSubmit(reason);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-brand-secondary" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-text text-center">فتح نزاع جديد</h2>
        <p className="text-center text-brand-text-secondary mb-6">سيتم تعليق الدفعة وإعلام الإدارة لمراجعة الحالة.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="reason" className="block text-brand-text-secondary text-sm font-bold mb-2">
                    اشرح سبب النزاع بالتفصيل
                </label>
                <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="مثال: البضاعة المستلمة تالفة، المنتج لا يطابق الوصف، الكمية ناقصة..."
                    rows={5}
                    className="w-full bg-brand-secondary text-brand-text placeholder-brand-text-secondary border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    required
                />
            </div>
            <div>
                <label className="block text-brand-text-secondary text-sm font-bold mb-2">
                    إرفاق دليل (صور - اختياري)
                </label>
                 <label className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-brand-accent bg-brand-secondary/50 transition-colors block">
                    <UploadIcon className="w-8 h-8 mx-auto text-brand-text-secondary"/>
                    <p className="text-brand-text-secondary mt-1 text-sm">انقر لإرفاق صور</p>
                    <input type="file" multiple accept="image/*" className="hidden" />
                </label>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
             <div className="mt-6 flex gap-4">
                <Button type="submit" className="w-full !bg-red-600 hover:!bg-red-700">تأكيد فتح النزاع</Button>
                <Button onClick={onClose} variant="secondary" className="w-full">إلغاء</Button>
            </div>
        </form>
      </div>
    </div>
  );
};