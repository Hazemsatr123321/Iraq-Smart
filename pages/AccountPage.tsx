import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Header } from '../components/Header';
import { Button } from '../components/common/Button';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { FileTextIcon } from '../components/icons/FileTextIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { TrendingUpIcon } from '../components/icons/TrendingUpIcon';
import { useAdmin } from '../contexts/AdminContext';
import { GavelIcon } from '../components/icons/GavelIcon';
import { ClipboardIcon } from '../components/icons/ClipboardIcon';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { BriefcaseIcon } from '../components/icons/BriefcaseIcon';
import { UsersIcon } from '../components/icons/UsersIcon';

const AccountOption: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  isFeatured?: boolean;
}> = ({ icon, title, description, onClick, isFeatured }) => (
  <button
    onClick={onClick}
    className={`w-full bg-brand-secondary p-6 rounded-2xl flex items-center gap-6 text-right hover:bg-brand-primary/50 transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden ${isFeatured ? 'border-2 border-brand-accent/50' : 'border-2 border-transparent hover:border-brand-accent'}`}
  >
    {isFeatured && (
      <div className="absolute top-0 right-0 h-full w-1 bg-brand-accent animate-pulse"></div>
    )}
    <div className={` p-4 rounded-xl ${isFeatured ? 'bg-brand-accent text-brand-primary' : 'bg-brand-primary text-brand-accent'}`}>{icon}</div>
    <div className="flex-grow">
      <h3 className={`text-xl font-bold ${isFeatured ? 'text-gradient-gold' : 'text-brand-text'}`}>{title}</h3>
      <p className="text-brand-text-secondary mt-1">{description}</p>
    </div>
    <ChevronLeftIcon className="w-6 h-6 text-brand-text-secondary" />
  </button>
);

export const AccountPage: React.FC<{ onNavigate: (path: string) => void; onLogout: () => void }> = ({ onNavigate, onLogout }) => {
  const { currentUser } = useUser();
  const { featureFlags } = useAdmin();

  if (!currentUser) {
    onNavigate('/auth');
    return null;
  }
  
  const handleLogout = () => {
    window.dispatchEvent(new CustomEvent('show-confirm', {
        detail: {
            title: 'تسجيل الخروج',
            message: 'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
            onConfirm: onLogout,
        }
    }));
  }

  const isWholesaler = currentUser.role === 'wholesaler' || currentUser.role === 'admin';
  const isRetailer = currentUser.role === 'retailer' || currentUser.role === 'admin';
  const isMarketAdvisorEnabled = featureFlags.find(f => f.id === 'marketAdvisor')?.is_enabled ?? false;
  const isDailyBriefingEnabled = featureFlags.find(f => f.id === 'dailyBriefing')?.is_enabled ?? false;
  const isRfqEnabled = featureFlags.find(f => f.id === 'requestForQuotation')?.is_enabled ?? false;

  return (
    <div className="min-h-screen bg-brand-primary text-brand-text">
      <Header variant="page" title="حسابي" onBack={() => onNavigate('/')} onNavigate={onNavigate} />

      <main className="container mx-auto p-4 pb-24">
        <div className="text-center mb-10">
          <img
            src={currentUser.profile_picture}
            alt={currentUser.name}
            className="w-28 h-28 rounded-full mx-auto border-4 border-brand-accent mb-4"
          />
          <h1 className="text-3xl font-bold text-white">أهلاً بعودتك، {currentUser.name.split(' ')[0]}!</h1>
          <p className="text-brand-text-secondary">{currentUser.email}</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-5">
            <AccountOption
                icon={<BriefcaseIcon className="w-7 h-7" />}
                title="غرفة الفرص"
                description="دع وكيل التوريد الذكي يجد لك أفضل الصفقات والطلبات."
                onClick={() => onNavigate('/opportunities-hub')}
                isFeatured={true}
              />

            {isWholesaler && (
             <AccountOption
                icon={<TrendingUpIcon className="w-7 h-7" />}
                title="تحليلات السوق الذكية"
                description="احصل على تقارير استخباراتية عن السوق لاتخاذ قرارات أفضل."
                onClick={() => onNavigate('/analyst')}
                isFeatured={true}
              />
          )}

          {isWholesaler && isMarketAdvisorEnabled && (
             <AccountOption
                icon={<ShieldCheckIcon className="w-7 h-7" />}
                title="مستشار التسعير والفرص"
                description="أداة ذكية لمقارنة الأسعار واكتشاف الفرص غير المستغلة."
                onClick={() => onNavigate('/advisor')}
              />
          )}
          
           {isWholesaler && isDailyBriefingEnabled && (
             <AccountOption
                icon={<BookOpenIcon className="w-7 h-7" />}
                title="الموجز اليومي للسوق"
                description="تقرير يومي ذكي عن حالة السوق والفرص المتاحة."
                onClick={() => onNavigate('/briefing')}
              />
          )}

          <AccountOption
            icon={<UserIcon className="w-7 h-7" />}
            title="ملفي الشخصي العام"
            description="عرض وتعديل معلوماتك التي تظهر للآخرين."
            onClick={() => onNavigate(`/profile/${currentUser.id}`)}
          />

          <AccountOption
            icon={<UsersIcon className="w-7 h-7" />}
            title="دعوة الأصدقاء والمكافآت"
            description="ادعُ التجار واكسب تمييز إعلانات مجاني."
            onClick={() => onNavigate('/referrals')}
          />

          {isWholesaler && (
            <AccountOption
              icon={<FileTextIcon className="w-7 h-7" />}
              title="إدارة إعلاناتي"
              description="تعديل، حذف، ومتابعة إعلاناتك."
              onClick={() => onNavigate(`/profile/${currentUser.id}?tab=myAds`)}
            />
          )}
          
          {isRetailer && isRfqEnabled && (
              <AccountOption
                icon={<ClipboardIcon className="w-7 h-7" />}
                title="طلبات عروض الأسعار"
                description="أنشئ طلبات للمنتجات التي تحتاجها واحصل على عروض."
                onClick={() => onNavigate(`/profile/${currentUser.id}?tab=myRfqs`)}
              />
          )}


            <AccountOption
              icon={<GavelIcon className="w-7 h-7" />}
              title="عروضي ومزاداتي"
              description="متابعة العروض التي قدمتها والمزادات التي تشارك بها."
              onClick={() => onNavigate(`/profile/${currentUser.id}?tab=myBids`)}
            />

          <AccountOption
            icon={<HeartIcon className="w-7 h-7" />}
            title="المفضلة"
            description="عرض الإعلانات التي قمت بحفظها."
            onClick={() => onNavigate(`/profile/${currentUser.id}?tab=favorites`)}
          />

          <AccountOption
            icon={<SettingsIcon className="w-7 h-7" />}
            title="إعدادات الحساب والأمان"
            description="تغيير كلمة المرور وتفضيلات الحساب."
            onClick={() => onNavigate(`/profile/${currentUser.id}?tab=settings`)}
          />

          <div className="pt-8">
            <Button onClick={handleLogout} variant="secondary" className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 !border-red-500/50 !text-red-400 hover:!bg-red-500 hover:!text-white">
              <LogoutIcon className="w-5 h-5" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};