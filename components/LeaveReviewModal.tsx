
import React, { useState } from 'react';
import { Button } from './common/Button';
import { StarIcon } from './icons/StarIcon';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  sellerName: string;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({ isOpen, onClose, onSubmit, sellerName }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0) {
      setError('الرجاء اختيار تقييم من 1 إلى 5 نجوم.');
      return;
    }
    setError('');
    onSubmit(rating, comment);
    // Reset state for next time
    setRating(0);
    setComment('');
  };
  
  const handleClose = () => {
    setRating(0);
    setComment('');
    setError('');
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-md p-6 border border-brand-secondary" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-brand-text text-center">أضف تقييمك</h2>
        <p className="text-center text-brand-text-secondary mb-6">ما هو تقييمك لـ <span className="font-bold text-white">{sellerName}</span>؟</p>
        
        <div className="flex justify-center items-center gap-2 mb-4">
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
              <button
                key={starValue}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(starValue)}
                className="transform transition-transform hover:scale-125"
              >
                <StarIcon className={`w-9 h-9 transition-colors ${(hoverRating || rating) >= starValue ? 'text-yellow-400' : 'text-gray-600'}`} />
              </button>
            );
          })}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتب تعليقك هنا (اختياري)..."
          rows={4}
          className="w-full bg-brand-secondary text-brand-text placeholder-brand-text-secondary border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

        <div className="mt-6 flex gap-4">
          <Button onClick={handleSubmit} className="w-full">إرسال التقييم</Button>
          <Button onClick={handleClose} variant="secondary" className="w-full">إلغاء</Button>
        </div>
      </div>
    </div>
  );
};