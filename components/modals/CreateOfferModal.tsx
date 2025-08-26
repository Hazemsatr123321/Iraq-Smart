import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAdmin } from '../../contexts/AdminContext';
import { Ad } from '../../types';

interface CreateOfferModalProps {
  onClose: () => void;
  onOfferCreated: () => void;
  sellerId: string;
}

export const CreateOfferModal: React.FC<CreateOfferModalProps> = ({ onClose, onOfferCreated, sellerId }) => {
  const { ads, createPersonalizedOffer } = useAdmin();
  const [selectedAdId, setSelectedAdId] = useState('');
  const [discount, setDiscount] = useState<number | string>('');
  const [error, setError] = useState('');
  
  const myAds = ads.filter(ad => ad.user_id === sellerId && ad.status === 'approved');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const discountValue = Number(discount);
    if (!selectedAdId || !discountValue || discountValue <= 0 || discountValue > 90) {
        setError('الرجاء اختيار إعلان وتحديد نسبة خصم صحيحة (بين 1 و 90).');
        return;
    }
    setError('');
    createPersonalizedOffer(selectedAdId, discountValue, sellerId);
    onOfferCreated();
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-md p-6 border border-brand-secondary" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-text text-center">إنشاء عرض مخصص</h2>
        <p className="text-center text-brand-text-secondary mb-6">سيظهر هذا العرض للمستخدمين الأكثر اهتماماً بمنتجاتك.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="ad-select" className="block text-brand-text-secondary text-sm font-bold mb-2">اختر الإعلان</label>
                <select 
                    id="ad-select"
                    value={selectedAdId}
                    onChange={(e) => setSelectedAdId(e.target.value)}
                    className="w-full bg-brand-secondary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                    <option value="">-- إعلاناتك المتاحة --</option>
                    {myAds.map(ad => <option key={ad.id} value={ad.id}>{ad.title}</option>)}
                </select>
            </div>
            <Input 
                label="نسبة الخصم (%)"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="مثال: 15"
                required
                min={1}
                max={90}
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
             <div className="mt-6 flex gap-4">
                <Button type="submit" className="w-full">إنشاء العرض</Button>
                <Button onClick={onClose} variant="secondary" className="w-full">إلغاء</Button>
            </div>
        </form>
      </div>
    </div>
  );
};