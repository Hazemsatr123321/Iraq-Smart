
import React from 'react';
import { ShieldOffIcon } from '../icons/ShieldOffIcon';

export const PermissionDenied: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-brand-secondary rounded-lg">
            <ShieldOffIcon className="w-20 h-20 text-red-500 mb-6" />
            <h2 className="text-3xl font-bold text-red-400 mb-2">الوصول مرفوض</h2>
            <p className="text-lg text-brand-text-secondary">
                عفواً، ليس لديك الصلاحية الكافية لعرض هذا القسم.
            </p>
        </div>
    );
};
