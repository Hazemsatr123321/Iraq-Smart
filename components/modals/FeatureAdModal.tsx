import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Ad, ToastType } from '../../types';
import { StarIcon } from '../icons/StarIcon';
import { useAdmin } from '../../contexts/AdminContext';
import { ZainCashIcon } from '../icons/ZainCashIcon';
import { CreditCardIcon } from '../icons/CreditCardIcon';
import { LoadingSpinner } from '../common/LoadingSpinner';

// Simple placeholder for AsiaPay icon
const AsiaPayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#0072BC"/>
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">A</text>
    </svg>
);

interface FeatureAdModalProps {
  ad: Ad | null;
  onClose: () => void;
  addToast: (message: string, type?: ToastType) => void;
}

type PaymentMethod = 'zain' | 'asia';

export const FeatureAdModal: React.FC<FeatureAdModalProps> = ({ ad, onClose, addToast }) => {
  const { settings, updateAd } = useAdmin();
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('zain');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!ad) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
        addToast("الرجاء إدخال رقم عملية التحويل.", "error");
        return;
    }
    
    setIsSubmitting(true);
    try {
        await updateAd(ad.id, {
            featured_status: 'pending_payment',
            payment_transaction_id: transactionId
        });
        addToast("تم استلام طلبك لتمييز الإعلان. سيتم تفعيله بعد المراجعة.", "success");
        onClose();
    } catch (error) {
        addToast("حدث خطأ أثناء إرسال طلبك. الرجاء المحاولة مرة أخرى.", "error");
        console.error("Error submitting feature request:", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderPaymentContent = () => {
    switch(activeMethod) {
        case 'zain':
            return (
                <div className="space-y-4">
                    <p className="text-center">يرجى تحويل مبلغ <strong className="text-brand-accent">{settings.featured_ad_price.toLocaleString()} دينار عراقي</strong> إلى الرقم التالي:</p>
                    <p className="text-center font-mono text-2xl bg-brand-primary/50 p-3 rounded-lg">{settings.zain_cash_number}</p>
                    <Input label="أدخل رقم عملية التحويل للتأكيد" value={transactionId} onChange={e => setTransactionId(e.target.value)} required />
                </div>
            );
        case 'asia':
            return (
                 <div className="space-y-4">
                    <p className="text-center">يرجى تحويل مبلغ <strong className="text-brand-accent">{settings.featured_ad_price.toLocaleString()} دينار عراقي</strong> إلى الرقم التالي:</p>
                    <p className="text-center font-mono text-2xl bg-brand-primary/50 p-3 rounded-lg">{settings.asia_pay_number}</p>
                    <Input label="أدخل رقم عملية التحويل للتأكيد" value={transactionId} onChange={e => setTransactionId(e.target.value)} required />
                </div>
            );
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-brand-secondary" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
            <StarIcon className="w-12 h-12 text-brand-accent mx-auto mb-2"/>
            <h2 className="text-2xl font-bold text-brand-text">تمييز الإعلان</h2>
            <p className="text-brand-text-secondary mb-1">سيظهر إعلانك "{ad.title}" للمزيد من المشترين.</p>
            <p className="text-lg font-bold">التكلفة: <span className="text-brand-accent">{settings.featured_ad_price.toLocaleString()} دينار عراقي</span></p>
        </div>

        {isSubmitting ? (
            <LoadingSpinner text="جاري تأكيد الدفع..." />
        ) : (
            <form onSubmit={handleSubmit} className="mt-6">
                <div className="flex justify-center gap-2 bg-brand-secondary/50 p-2 rounded-lg mb-6">
                    <button type="button" onClick={() => setActiveMethod('zain')} className={`flex-1 p-2 rounded-md flex items-center justify-center gap-2 font-bold transition-colors ${activeMethod === 'zain' ? 'bg-brand-accent text-brand-primary' : 'hover:bg-brand-primary/50'}`}>
                        <ZainCashIcon /> زين كاش
                    </button>
                    <button type="button" onClick={() => setActiveMethod('asia')} className={`flex-1 p-2 rounded-md flex items-center justify-center gap-2 font-bold transition-colors ${activeMethod === 'asia' ? 'bg-brand-accent text-brand-primary' : 'hover:bg-brand-primary/50'}`}>
                        <AsiaPayIcon /> آسيا باي
                    </button>
                </div>
                
                {renderPaymentContent()}
                
                <div className="mt-6 flex gap-4">
                    <Button type="submit" className="w-full">
                        تأكيد الدفع
                    </Button>
                    <Button onClick={onClose} variant="secondary" className="w-full">إلغاء</Button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};