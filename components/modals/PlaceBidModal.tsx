
import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface PlaceBidModalProps {
  currentPrice: number;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

export const PlaceBidModal: React.FC<PlaceBidModalProps> = ({ currentPrice, onClose, onSubmit }) => {
  const [amount, setAmount] = useState<number | string>('');
  const [error, setError] = useState('');
  
  const minBid = currentPrice + 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bidAmount = Number(amount);
    if (!bidAmount || bidAmount <= currentPrice) {
        setError(`يجب أن تكون مزايدتك أعلى من ${currentPrice.toLocaleString()} د.ع`);
        return;
    }
    setError('');
    onSubmit(bidAmount);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-md p-6 border border-brand-secondary" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-text text-center">قدّم مزايدتك</h2>
        <p className="text-center text-brand-text-secondary mb-6">السعر الحالي: <span className="font-bold text-brand-accent">{currentPrice.toLocaleString()} د.ع</span></p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                label={`أدخل مبلغاً أعلى من ${currentPrice.toLocaleString()}`}
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`مثال: ${minBid.toLocaleString()}`}
                required
                min={minBid}
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
             <div className="mt-6 flex gap-4">
                <Button type="submit" className="w-full">تأكيد المزايدة</Button>
                <Button onClick={onClose} variant="secondary" className="w-full">إلغاء</Button>
            </div>
        </form>
      </div>
    </div>
  );
};
