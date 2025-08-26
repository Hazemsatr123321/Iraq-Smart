
import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface OfferModalProps {
  rfqId: string;
  onClose: () => void;
  onSubmit: (rfqId: string, price: number, comments: string) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({ rfqId, onClose, onSubmit }) => {
  const [price, setPrice] = useState<number | string>('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = Number(price);
    if (!priceValue || priceValue <= 0) {
      setError('الرجاء إدخال سعر صحيح.');
      return;
    }
    setError('');
    onSubmit(rfqId, priceValue, comments);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-md p-6 border border-brand-secondary" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-text text-center">تقديم عرض سعر</h2>
        <p className="text-center text-brand-text-secondary mb-6">سيتم إرسال عرضك مباشرة إلى صاحب الطلب.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="السعر للوحدة (دينار عراقي)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="مثال: 40000"
            required
            min={1}
          />
          <div className="space-y-2">
            <label htmlFor="comments" className="block text-brand-text-secondary text-sm font-bold">ملاحظات (اختياري)</label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="أي تفاصيل إضافية حول عرضك (مثل: شامل التوصيل، جودة ممتازة، ...)"
              rows={3}
              className="w-full bg-brand-secondary text-brand-text placeholder-brand-text-secondary border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="mt-6 flex gap-4">
            <Button type="submit" className="w-full">إرسال العرض</Button>
            <Button onClick={onClose} variant="secondary" className="w-full">إلغاء</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
