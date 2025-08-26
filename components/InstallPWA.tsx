import React from 'react';
import { Button } from './common/Button';

interface InstallPWAProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const InstallPWA: React.FC<InstallPWAProps> = ({ onInstall, onDismiss }) => {
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fadeInUp"
      style={{
        paddingBottom: 'calc(1rem + var(--safe-area-inset-bottom))',
        animationDuration: '0.5s'
      }}
    >
      <div className="container mx-auto max-w-2xl bg-brand-secondary/80 backdrop-blur-lg p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-brand-accent/30">
        <img src="/icons/icon-192x192.png" alt="أيقونة التطبيق" className="w-16 h-16 rounded-lg flex-shrink-0" />
        <div className="flex-grow">
          <h3 className="font-bold text-lg text-white">ثبّت تطبيق سوق العراق الذكي</h3>
          <p className="text-sm text-brand-text-secondary hidden sm:block">احصل على تجربة أسرع، وصول سهل من شاشتك الرئيسية، ويعمل حتى بدون انترنت.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={onInstall} className="!py-2 !px-4 whitespace-nowrap">
            تثبيت
          </Button>
          <button onClick={onDismiss} className="text-sm text-brand-text-secondary hover:text-white p-2 rounded-md">
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
};
