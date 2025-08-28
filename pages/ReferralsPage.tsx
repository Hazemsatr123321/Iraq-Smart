import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { useUser } from '../contexts/UserContext';
import { useAdmin } from '../contexts/AdminContext';
import { Button } from '../components/common/Button';
import { UsersIcon } from '../components/icons/UsersIcon';
import { AwardIcon } from '../components/icons/AwardIcon';
import { CopyIcon } from '../components/icons/CopyIcon';
import { ToastType } from '../types';
import { ShareIcon } from '../components/icons/ShareIcon';

export const ReferralsPage: React.FC<{ 
    onNavigate: (path: string) => void,
    addToast: (message: string, type?: ToastType) => void
}> = ({ onNavigate, addToast }) => {
    const { currentUser } = useUser();
    const [isCopied, setIsCopied] = useState(false);

    if (!currentUser) {
        onNavigate('/auth');
        return null;
    }
    
    const referralLink = `${window.location.origin}${window.location.pathname}#/auth?ref=${currentUser.referral_code}`;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink).then(() => {
            addToast('تم نسخ رابط الدعوة بنجاح!', 'success');
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }, () => {
            addToast('فشل نسخ الرابط.', 'error');
        });
    };

    const handleShare = async () => {
        if (!currentUser) return;
        const shareData = {
          title: 'انضم إلى سوق العراق الذكي!',
          text: `أدعوك للانضمام إلى سوق العراق الذكي، أفضل منصة لتجار الجملة وأصحاب المحلات في العراق. استخدم كود الدعوة الخاص بي عند التسجيل: ${currentUser.referral_code}`,
          url: referralLink,
        };
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            console.error("Share failed:", err);
          }
        } else {
            addToast('متصفحك لا يدعم المشاركة المباشرة. استخدم زر النسخ بدلاً من ذلك.', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-brand-primary text-brand-text">
            <Header variant="page" title="دعوة الأصدقاء والمكافآت" onBack={() => onNavigate('/account')} onNavigate={onNavigate} />
            <main className="container mx-auto p-4 pb-24">
                <div className="max-w-3xl mx-auto text-center">
                    <AwardIcon className="w-16 h-16 text-brand-accent mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-gold">
                        اكسب معنا عبر دعوة أصدقائك
                    </h1>
                    <p className="mt-4 text-lg text-brand-text-secondary max-w-2xl mx-auto">
                        لكل 10 تجار أو أصحاب محلات يسجلون عبر رابطك، ستحصل على تمييز مجاني لأحد إعلاناتك لمدة يومين كاملين!
                    </p>
                </div>

                <div className="max-w-3xl mx-auto bg-brand-secondary p-8 mt-12 rounded-2xl shadow-lg border border-gray-700/50 space-y-8">
                    {/* Your Referral Link */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-3">رابط الدعوة الخاص بك</h3>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={referralLink}
                                readOnly
                                className="w-full bg-brand-primary/60 text-brand-text-secondary border-2 border-gray-600 rounded-lg p-3 focus:outline-none"
                            />
                            {navigator.share && (
                                <Button onClick={handleShare} className="!px-4 flex-shrink-0" title="مشاركة الرابط">
                                    <ShareIcon className="w-5 h-5" />
                                </Button>
                            )}
                            <Button onClick={handleCopy} className="!px-4 flex-shrink-0" title="نسخ الرابط">
                                <CopyIcon className="w-5 h-5" />
                            </Button>
                        </div>
                        {isCopied && <p className="text-green-400 text-sm mt-2">تم النسخ!</p>}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-700">
                        <div className="bg-brand-primary/50 p-6 rounded-lg text-center">
                            <UsersIcon className="w-10 h-10 text-brand-accent mx-auto mb-3" />
                            <p className="text-4xl font-bold text-white">{referralCount}</p>
                            <p className="text-brand-text-secondary">مستخدم سجل عبر رابطك</p>
                        </div>
                        <div className="bg-brand-primary/50 p-6 rounded-lg text-center">
                            <AwardIcon className="w-10 h-10 text-brand-accent mx-auto mb-3" />
                            <p className="text-4xl font-bold text-white">{currentUser.available_feature_rewards}</p>
                            <p className="text-brand-text-secondary">تمييز مجاني متاح للاستخدام</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};