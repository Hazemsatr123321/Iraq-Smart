import React from 'react';
import { Button } from '../common/Button';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { CameraIcon } from '../icons/CameraIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

interface PermissionWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionWelcomeModal: React.FC<PermissionWelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[201] flex items-center justify-center p-4 animate-fadeInUp" style={{animationDuration: '0.3s'}}>
      <div 
        className="bg-brand-secondary/50 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-lg border border-brand-accent/30 modal-glow-animation p-8 text-center"
      >
        <SparklesIcon className="w-12 h-12 text-brand-accent mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gradient-gold mb-3">تفعيل الميزات الذكية</h2>
        <p className="text-brand-text-secondary mb-8">
            للحصول على أفضل تجربة، يحتاج التطبيق إلى الوصول إلى بعض الميزات. خصوصيتك هي أولويتنا.
        </p>

        <div className="space-y-6 text-right mb-10">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-primary rounded-xl">
                   <MicrophoneIcon className="w-7 h-7 text-brand-accent flex-shrink-0" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-white">الميكروفون</h3>
                    <p className="text-brand-text-secondary text-sm">لتفعيل ميزة "البحث الصوتي" القوية، مما يتيح لك البحث عن المنتجات بصوتك بكل سهولة.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                 <div className="p-3 bg-brand-primary rounded-xl">
                    <CameraIcon className="w-7 h-7 text-brand-accent flex-shrink-0" />
                 </div>
                <div>
                    <h3 className="font-bold text-lg text-white">الكاميرا</h3>
                    <p className="text-brand-text-secondary text-sm">لاستخدام ميزة "البحث بالصورة" مستقبلاً، حيث يمكنك تصوير أي منتج للعثور عليه في السوق.</p>
                </div>
            </div>
        </div>

        <Button onClick={onClose} className="w-full max-w-xs mx-auto">
            فهمت، لنبدأ
        </Button>
      </div>
    </div>
  );
};