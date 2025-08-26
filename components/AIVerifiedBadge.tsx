import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

export const AIVerifiedBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div 
        className={`flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 text-sm font-bold rounded-lg shadow-lg border border-blue-400/50 ${className}`}
        title="تم التحقق من جودة هذا المنتج بواسطة الذكاء الاصطناعي"
    >
        <ShieldCheckIcon className="w-5 h-5 text-blue-400"/>
        <span>تم التحقق بالجودة</span>
    </div>
);