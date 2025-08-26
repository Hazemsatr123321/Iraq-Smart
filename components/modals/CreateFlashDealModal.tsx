
import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import type { Ad } from '../../types';

interface CreateFlashDealModalProps {
  ad: Ad | null;
  onClose: () => void;
  onSubmit: (adId: string, dealPrice: string, durationHours: number) => void;
}

export const CreateFlashDealModal: React.FC<CreateFlashDealModalProps> = ({ ad, onClose, onSubmit }) => {
  const [dealPrice, setDealPrice] = useState('');
  const [duration, setDuration] = useState(6); // Default 6 hours
  const [error, setError] = useState('');

  if (!ad) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealPrice.trim()) {
      setError('الرجاء إدخال سعر الصفقة.');
      return;
    }
    const numericDealPrice = parseFloat(dealPrice.replace(/[^0-9]/g, ''));
    const numericOriginalPrice = parseFloat(ad.price.replace(/[^0-9]/g, ''));
    if (numericDealPrice >= numericOriginalPrice) {
        setError('يجب أن يكون سعر الصفقة أقل من السعر الأصلي.');
        return;
    }
    setError('');
    onSubmit(ad.id, dealPrice, duration);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-md p-6 border border-brand-secondary" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-text text-center">إنشاء صفقة برق</h2>
        <p className="text-center text-brand-text-secondary mb-2">الإعلان: <span className="font-semibold text-white">{ad.title}</span></p>
        <p className="text-center text-brand-text-secondary mb-6">السعر الحالي: <span className="font-bold text-brand-accent">{ad.price}</span></p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                label="سعر الصفقة الجديد"
                type="text"
                value={dealPrice}
                onChange={(e) => setDealPrice(e.target.value)}
                placeholder="مثال: 425,000 دينار / قطعة"
                required
            />
             <div>
                <label htmlFor="duration" className="block text-brand-text-secondary text-sm font-bold mb-2">مدة الصفقة</label>
                <select 
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-brand-secondary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                    <option value={3}>3 ساعات</option>
                    <option value={6}>6 ساعات</option>
                    <option value={12}>12 ساعة</option>
                    <option value={24}>24 ساعة</option>
                </select>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
             <div className="mt-6 flex gap-4">
                <Button type="submit" className="w-full !bg-red-600 hover:!bg-red-700">تفعيل الصفقة</Button>
                <Button onClick={onClose} variant="secondary" className="w-full">إلغاء</Button>
            </div>
        </form>
      </div>
    </div>
  );
};