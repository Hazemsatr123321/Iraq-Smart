import React from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';

export const FullScreenLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-brand-primary flex flex-col items-center justify-center z-[200]">
      <div className="relative">
        <SparklesIcon className="w-24 h-24 text-brand-accent animate-spin" style={{ animationDuration: '3s' }} />
      </div>
      <h1 className="text-3xl font-extrabold text-gradient-gold mt-6">سوق العراق الذكي</h1>
      <p className="text-brand-text-secondary mt-2 animate-pulse">...جاري تحميل السوق</p>
    </div>
  );
};