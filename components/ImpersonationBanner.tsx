
import React from 'react';
import { Button } from './common/Button';
import { LogoutIcon } from './icons/LogoutIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';


interface ImpersonationBannerProps {
  adminName: string;
  onStop: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ adminName, onStop }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-black p-2 z-[101] shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-6 h-6"/>
            <p className="text-sm font-bold">
                أنت الآن تتصفح كـمستخدم. (حساب المدير: {adminName})
            </p>
        </div>
        <button onClick={onStop} className="flex items-center gap-2 text-sm font-bold hover:bg-black/20 p-2 rounded-md transition-colors">
            <LogoutIcon className="w-5 h-5 rotate-180"/>
            العودة إلى حساب المدير
        </button>
      </div>
    </div>
  );
};
