import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface AddTrackingModalProps {
  onClose: () => void;
  onSubmit: (shippingInfo: { company: string; trackingNumber: string; }) => void;
}

export const AddTrackingModal: React.FC<AddTrackingModalProps> = ({ onClose, onSubmit }) => {
  const [company, setCompany] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !trackingNumber.trim()) {
      setError('الرجاء ملء جميع الحقول.');
      return;
    }
    setError('');
    onSubmit({ company, trackingNumber });
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-md p-6 border border-brand-secondary" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-text text-center">إضافة معلومات الشحن</h2>
        <p className="text-center text-brand-text-secondary mb-6">سيتم إعلام المشتري بهذه التفاصيل فور إضافتها.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                label="اسم شركة الشحن"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="مثال: شركة النخيل للشحن"
                required
            />
            <Input 
                label="رقم التتبع"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="مثال: IQ123456789"
                required
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
             <div className="mt-6 flex gap-4">
                <Button type="submit" className="w-full">تأكيد الشحن</Button>
                <Button onClick={onClose} variant="secondary" className="w-full">إلغاء</Button>
            </div>
        </form>
      </div>
    </div>
  );
};