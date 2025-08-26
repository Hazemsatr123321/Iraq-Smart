
import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { SparklesIcon } from '../icons/SparklesIcon';

interface AiOfferModalProps {
  rfqId: string;
  onClose: () => void;
  onSubmit: (rfqId: string, price: number, comments: string) => void;
  initialPrice: number;
  initialText: string;
}

export const AiOfferModal: React.FC<AiOfferModalProps> = ({ rfqId, onClose, onSubmit, initialPrice, initialText }) => {
  const [price, setPrice] = useState<number | string>(initialPrice);
  const [comments, setComments] = useState(initialText);
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
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-brand-accent/50 modal-glow-animation" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
            <SparklesIcon className="w-12 h-12 text-brand-accent mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-gradient-gold">عرض سعر مُنشأ بواسطة الذكاء الاصطناعي</h2>
            <p className="text-center text-brand-text-secondary mb-6">راجع العرض المقترح، عدّله حسب رغبتك، ثم أرسله.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="السعر المقترح للوحدة (دينار عراقي)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min={1}
          />
          <div className="space-y-2">
            <label htmlFor="comments" className="block text-brand-text-secondary text-sm font-bold">نص العرض المقترح</label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={5}
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
