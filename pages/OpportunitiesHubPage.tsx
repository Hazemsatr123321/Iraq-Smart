
import React from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useUser } from '../contexts/UserContext';
import { Header } from '../components/Header';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { BriefcaseIcon } from '../components/icons/BriefcaseIcon';
import { FileTextIcon } from '../components/icons/FileTextIcon';
import { ClipboardIcon } from '../components/icons/ClipboardIcon';

export const OpportunitiesHubPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const { currentUser } = useUser();
    const { getOpportunitiesForUser } = useAdmin();

    if (!currentUser) {
        onNavigate('/auth');
        return null;
    }

    const opportunities = getOpportunitiesForUser(currentUser);

    const OpportunityCard: React.FC<{ opportunity: (typeof opportunities)[0] }> = ({ opportunity }) => {
        const icon = opportunity.type === 'ad_match' ? <FileTextIcon className="w-6 h-6 text-green-400" /> : <ClipboardIcon className="w-6 h-6 text-blue-400" />;
        const path = opportunity.type === 'ad_match' ? `/ad/${opportunity.related_id}` : '/rfqs';

        return (
            <div
                onClick={() => onNavigate(path)}
                className="bg-brand-secondary p-5 rounded-xl shadow-lg border border-gray-700/50 hover:border-brand-accent transition-colors cursor-pointer"
            >
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">{icon}</div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-brand-text">{opportunity.title}</h3>
                        <p className="text-sm text-brand-text-secondary mt-1">{opportunity.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(opportunity.timestamp).toLocaleDateString('ar-IQ')}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-brand-primary text-brand-text">
            <Header variant="page" title="غرفة الفرص" onBack={() => onNavigate('/account')} onNavigate={onNavigate} />
            <main className="container mx-auto p-4 pb-24">
                <div className="text-center mb-12">
                    <BriefcaseIcon className="w-16 h-16 text-brand-accent mx-auto mb-4"/>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gradient-gold">
                        وكيل التوريد الذكي الخاص بك
                    </h1>
                    <p className="mt-4 text-lg text-brand-text-secondary max-w-2xl mx-auto">
                        يقوم وكيلنا الذكي بالبحث في السوق على مدار الساعة ليقدم لك الفرص الأكثر ملاءمةً لأعمالك.
                    </p>
                </div>

                {opportunities.length > 0 ? (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {opportunities.map(opp => <OpportunityCard key={opp.id} opportunity={opp} />)}
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <EmptyState
                            icon={<BriefcaseIcon />}
                            title="لا توجد فرص مخصصة حالياً"
                            message="يقوم الوكيل الذكي بالبحث باستمرار. تأكد من أن لديك إعلانات أو طلبات نشطة ليتمكن من إيجاد أفضل الفرص لك."
                        >
                            {currentUser.role === 'wholesaler' ? (
                                <Button onClick={() => onNavigate('/post')} className="mt-6">أضف إعلاناً جديداً</Button>
                            ) : (
                                <Button onClick={() => onNavigate('/post-rfq')} className="mt-6">أنشئ طلب أسعار</Button>
                            )}
                        </EmptyState>
                    </div>
                )}
            </main>
        </div>
    );
};