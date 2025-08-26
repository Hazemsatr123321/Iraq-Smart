import React from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { Header } from '../components/Header';
import { Button } from '../components/common/Button';
import { useUser } from '../contexts/UserContext';
import { PlusIcon } from '../components/icons/PlusIcon';
import { ToastType, RequestForQuotation } from '../types';
import { generateRfqOffer } from '../services/geminiService';
import { AiOfferModal } from '../components/modals/AiOfferModal';
import { SparklesIcon } from '../components/icons/SparklesIcon';

export const RFQListPage: React.FC<{
    onNavigate: (path: string) => void,
    addToast: (message: string, type?: ToastType) => void
}> = ({ onNavigate, addToast }) => {
  const { rfqs, addOfferToRfq, ads, users } = useAdmin();
  const { currentUser } = useUser();
  const [selectedRfq, setSelectedRfq] = React.useState<RequestForQuotation | null>(null);
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const [aiOffer, setAiOffer] = React.useState<{ suggestedPrice: number; offerText: string } | null>(null);

  const canPostRfq = currentUser && (currentUser.role === 'retailer' || currentUser.role === 'admin');
  const canMakeOffer = currentUser && (currentUser.role === 'wholesaler' || currentUser.role === 'admin');
  
  const handleAiOffer = async (rfq: RequestForQuotation) => {
    if (!currentUser) return;
    setIsAiLoading(true);
    setSelectedRfq(rfq);
    try {
        const sellerAds = ads.filter(ad => ad.user_id === currentUser.id && ad.status === 'approved');
        const offer = await generateRfqOffer(rfq, sellerAds);
        setAiOffer(offer);
    } catch (error) {
        addToast("فشل في توليد عرض الذكاء الاصطناعي.", "error");
        setAiOffer(null);
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleOfferSubmit = async (rfqId: string, price: number, comments: string) => {
    if (!currentUser) {
        addToast("يجب تسجيل الدخول لتقديم عرض.", "error");
        return;
    }
    try {
        await addOfferToRfq({ rfq_id: rfqId, price_per_unit: price, comments }, currentUser.id);
        addToast('تم تقديم عرضك بنجاح!', 'success');
        setSelectedRfq(null);
        setAiOffer(null);
    } catch (error: any) {
        addToast(error.message || 'حدث خطأ أثناء تقديم العرض', 'error');
    }
  }

  return (
    <div className="min-h-screen bg-brand-primary text-brand-text">
      <Header variant="page" title="طلبات عروض الأسعار" onBack={() => onNavigate('/ads')} onNavigate={onNavigate} />
      <main className="container mx-auto p-4 pb-24">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-4xl font-bold text-gradient-gold">سوق الطلبات</h1>
                <p className="text-brand-text-secondary mt-2">تجار الجملة: تصفحوا طلبات المشترين وقدموا أفضل عروضكم.</p>
            </div>
            {canPostRfq && (
                <Button onClick={() => onNavigate('/post-rfq')} className="flex items-center gap-2">
                    <PlusIcon />
                    أضف طلبك
                </Button>
            )}
        </div>
        
        <div className="space-y-4">
          {rfqs.filter(r => r.status === 'open').map(rfq => {
            const user = users.find(u => u.id === rfq.user_id);
            if (!user) return null;

            return (
              <div key={rfq.id} className="bg-brand-secondary p-5 rounded-xl shadow-lg border border-gray-700/50">
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div className="flex-grow">
                        <div className="flex items-center gap-4 mb-3">
                            <img src={user.profile_picture} alt={user.name} className="w-12 h-12 rounded-full"/>
                            <div>
                                <p className="font-bold text-brand-text">{user.name}</p>
                                <p className="text-xs text-brand-text-secondary">{new Date(rfq.timestamp).toLocaleDateString('ar-IQ')}</p>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-brand-accent mb-1">{rfq.product_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-brand-text-secondary mb-2">
                           <span>الكمية المطلوبة: <span className="font-bold text-white">{rfq.quantity}</span></span>
                           <span>الفئة: <span className="font-bold text-white">{rfq.category}</span></span>
                           <span>المحافظة: <span className="font-bold text-white">{rfq.province}</span></span>
                        </div>
                        <p className="text-brand-text-secondary text-sm max-w-2xl">{rfq.details}</p>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0 flex flex-col gap-2">
                        {canMakeOffer && (
                            <Button onClick={() => handleAiOffer(rfq)} disabled={isAiLoading && selectedRfq?.id === rfq.id} className="w-full flex justify-center items-center gap-2">
                                {isAiLoading && selectedRfq?.id === rfq.id 
                                    ? 'يفكر...' 
                                    : <><SparklesIcon className="w-5 h-5"/> دع الذكاء الاصطناعي يكتب العرض</>
                                }
                            </Button>
                        )}
                    </div>
                </div>
              </div>
            );
          })}
        </div>
        {rfqs.filter(r => r.status === 'open').length === 0 && (
             <div className="text-center py-20 bg-brand-secondary rounded-2xl">
                <p className="text-xl text-brand-text-secondary">لا توجد طلبات عروض أسعار مفتوحة حالياً.</p>
             </div>
        )}
      </main>
      {(selectedRfq && aiOffer) && (
          <AiOfferModal
            rfqId={selectedRfq.id}
            onClose={() => { setSelectedRfq(null); setAiOffer(null); }}
            onSubmit={handleOfferSubmit}
            initialPrice={aiOffer.suggestedPrice}
            initialText={aiOffer.offerText}
          />
      )}
    </div>
  );
};