
import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { LightbulbIcon } from '../icons/LightbulbIcon';
import { generateAdOptimizationAdvice } from '../../services/geminiService';
import type { Ad } from '../../types';

interface AdOptimizerModalProps {
  ad: Ad | null;
  onClose: () => void;
}

export const AdOptimizerModal: React.FC<AdOptimizerModalProps> = ({ ad, onClose }) => {
  const [advice, setAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (ad) {
      setIsLoading(true);
      setAdvice('');
      generateAdOptimizationAdvice(ad)
        .then(setAdvice)
        .catch(() => setAdvice("حدث خطأ أثناء تحليل الإعلان."))
        .finally(() => setIsLoading(false));
    }
  }, [ad]);

  if (!ad) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeInUp" style={{animationDuration: '0.3s'}} onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-brand-secondary" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <LightbulbIcon className="w-8 h-8 text-brand-accent"/>
          <h2 className="text-2xl font-bold text-brand-text">محسّن الإعلانات الذكي</h2>
        </div>
        <p className="text-brand-text-secondary mb-1">تحليل لإعلان:</p>
        <h3 className="text-lg font-semibold text-white mb-6">{ad.title}</h3>

        {isLoading ? (
          <LoadingSpinner text="المستشار الذكي يحلل إعلانك..." />
        ) : (
          <div className="bg-brand-secondary p-4 rounded-lg max-h-80 overflow-y-auto">
            <p className="text-white whitespace-pre-line leading-relaxed">{advice}</p>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="secondary">إغلاق</Button>
        </div>
      </div>
    </div>
  );
};