import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { useAdmin } from '../contexts/AdminContext';
import { HandHeartIcon } from '../components/icons/HandHeartIcon';
import { AdCard } from '../components/AdCard';
import { EmptyState } from '../components/common/EmptyState';
import { FileTextIcon } from '../components/icons/FileTextIcon';
import { AwardIcon } from '../components/icons/AwardIcon';
import { RibbonIcon } from '../components/icons/RibbonIcon';
import { CampaignCard } from '../components/CampaignCard';
import { DonationModal } from '../components/modals/DonationModal';
import { Campaign, ToastType } from '../types';
import { Button } from '../components/common/Button';
import { PlusIcon } from '../components/icons/PlusIcon';

type SocialTab = 'needy' | 'projects' | 'campaigns';

const InfoBox: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
    <div className="bg-brand-primary/40 border border-brand-accent/30 rounded-xl p-4 flex items-start gap-4 mb-8 text-center md:text-right">
        <div className="hidden md:block flex-shrink-0 text-brand-accent">{icon}</div>
        <p className="text-brand-text-secondary w-full">{text}</p>
    </div>
);

export const SocialSupportPage: React.FC<{ 
    onNavigate: (path: string) => void,
    addToast: (message: string, type?: ToastType) => void
}> = ({ onNavigate, addToast }) => {
    const { ads, users, settings, campaigns } = useAdmin();
    const [activeTab, setActiveTab] = useState<SocialTab>('needy');
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    const charitableAds = useMemo(() => {
        return ads.filter(ad => ad.is_charitable && ad.status === 'approved' && ad.category === 'مواد غذائية');
    }, [ads]);

    const smallProjectAds = useMemo(() => {
        return ads.filter(ad => {
            if (!ad.featured) return false;
            const user = users.find(u => u.id === ad.user_id);
            // We assume retailers are small projects for this feature
            return user?.role === 'retailer';
        });
    }, [ads, users]);

    const activeCampaigns = useMemo(() => {
        return campaigns.filter(c => c.is_active);
    }, [campaigns]);

    const TabButton: React.FC<{ title: string, count: number, isActive: boolean, onClick: () => void, icon: React.ReactNode }> = ({ title, count, isActive, onClick, icon }) => (
        <button
            onClick={onClick}
            className={`flex-1 p-4 text-center font-bold text-lg border-b-4 transition-all duration-300 flex items-center justify-center gap-3 ${
                isActive ? 'border-brand-accent text-brand-accent bg-brand-primary/50' : 'border-transparent text-brand-text-secondary hover:bg-brand-primary/30'
            }`}
        >
            {icon}
            {title}
            <span className={`px-2.5 py-1 rounded-full text-sm font-semibold transition-colors ${isActive ? 'bg-brand-accent text-brand-primary' : 'bg-brand-primary text-brand-text'}`}>
                {count}
            </span>
        </button>
    );

    return (
        <div className="min-h-screen bg-brand-primary text-brand-text social-support-bg">
            {selectedCampaign && <DonationModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} addToast={addToast} />}
            <Header variant="page" title="دعم الخير والمشاريع" onBack={() => onNavigate('/ads')} onNavigate={onNavigate} />
            <main className="container mx-auto p-4 pb-24">
                <div className="text-center mb-12 animate-fadeInUp">
                    <HandHeartIcon className="w-16 h-16 text-brand-accent mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-gold">
                        مبادرات سوق العراق الذكي
                    </h1>
                    <p className="mt-4 text-lg text-brand-text-secondary max-w-2xl mx-auto">
                        نؤمن بدورنا في دعم المجتمع. هنا تجد مبادراتنا لدعم المحتاجين وتشجيع المشاريع الناشئة.
                    </p>
                </div>

                <div className="bg-brand-secondary rounded-2xl overflow-hidden shadow-lg border border-gray-700/30">
                    {/* Tabs */}
                    <div className="flex">
                        <TabButton
                            title="دعم الفقراء"
                            count={charitableAds.length}
                            isActive={activeTab === 'needy'}
                            onClick={() => setActiveTab('needy')}
                            icon={<HandHeartIcon className="w-6 h-6"/>}
                        />
                         <TabButton
                            title="حملات إنسانية"
                            count={activeCampaigns.length}
                            isActive={activeTab === 'campaigns'}
                            onClick={() => setActiveTab('campaigns')}
                            icon={<RibbonIcon className="w-6 h-6"/>}
                        />
                        <TabButton
                            title="دعم المشاريع"
                            count={smallProjectAds.length}
                            isActive={activeTab === 'projects'}
                            onClick={() => setActiveTab('projects')}
                            icon={<AwardIcon className="w-6 h-6"/>}
                        />
                    </div>
                </div>
                
                {/* Content */}
                <div className="mt-8">
                    {activeTab === 'needy' && (
                        <div className="animate-fadeInUp">
                             <InfoBox icon={<HandHeartIcon className="w-8 h-8"/>} text={settings.charity_program_description} />
                            {charitableAds.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {charitableAds.map(ad => <AdCard key={ad.id} ad={ad} onClick={() => onNavigate(`/ad/${ad.id}`)} />)}
                                </div>
                            ) : (
                                <EmptyState icon={<FileTextIcon />} title="لا توجد إعلانات خيرية حالياً" message="لا يوجد تجار مشاركون في هذه المبادرة في الوقت الحالي. كن أول المشاركين!" />
                            )}
                        </div>
                    )}

                    {activeTab === 'campaigns' && (
                         <div className="animate-fadeInUp">
                             <InfoBox icon={<RibbonIcon className="w-8 h-8"/>} text="ساهم في دعم الحملات الإنسانية لمساعدة مرضى السرطان. كل تبرع، مهما كان صغيراً، يساهم في إنقاذ حياة." />
                             {activeCampaigns.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeCampaigns.map(campaign => <CampaignCard key={campaign.id} campaign={campaign} onDonate={setSelectedCampaign} />)}
                                </div>
                            ) : (
                                <EmptyState icon={<RibbonIcon />} title="لا توجد حملات فعالة حالياً" message="شكراً لاهتمامك. سيتم إطلاق حملات جديدة قريباً." />
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'projects' && (
                         <div className="animate-fadeInUp">
                             <InfoBox icon={<AwardIcon className="w-8 h-8"/>} text={settings.small_projects_program_description} />
                             {smallProjectAds.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {smallProjectAds.map(ad => <AdCard key={ad.id} ad={ad} onClick={() => onNavigate(`/ad/${ad.id}`)} />)}
                                </div>
                            ) : (
                                <EmptyState icon={<AwardIcon />} title="لا توجد مشاريع مدعومة حالياً" message="تقوم الإدارة باختيار المشاريع بشكل أسبوعي. تفقد هذه الصفحة قريباً!" />
                            )}
                        </div>
                    )}
                </div>
                
                 <div className="mt-12 bg-brand-secondary/50 p-6 rounded-2xl border border-brand-accent/20 text-center animate-fadeInUp">
                    <h3 className="text-2xl font-bold text-gradient-gold mb-3">هل أنت تاجر جملة وتريد المساهمة؟</h3>
                    <p className="text-brand-text-secondary mb-6">يمكنك بسهولة المشاركة في مبادرة "دعم الفقراء" عبر تفعيل خيار "المشاركة في حملة دعم الفقراء" عند إضافة أو تعديل إعلانك للمواد الغذائية.</p>
                    <Button onClick={() => onNavigate('/post')} className="flex items-center justify-center gap-2 mx-auto">
                        <PlusIcon/>
                        أضف إعلانك الخيري الآن
                    </Button>
                </div>
            </main>
        </div>
    );
};