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

export const FeatureAdModal: React.FC<FeatureAdModalProps> = ({ ad, onClose, addToast }) => {
  const { settings, paymentMethods } = useAdmin();
  const activeFeatureMethods = paymentMethods.filter(p => p.is_active_for_features);

  const [activeMethodId, setActiveMethodId] = useState<string | null>(activeFeatureMethods[0]?.id || null);
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!ad) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMethod = activeFeatureMethods.find(m => m.id === activeMethodId);
    if (selectedMethod && selectedMethod.type !== 'card' && !transactionId.trim()) {
        addToast("الرجاء إدخال رقم عملية التحويل.", "error");
        return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(res => setTimeout(res, 2000));
    
    setIsSubmitting(false);
    addToast("تم استلام طلبك لتمييز الإعلان. سيتم تفعيله بعد المراجعة.", "success");
    onClose();
  };

  const renderPaymentContent = () => {
    const method = activeFeatureMethods.find(m => m.id === activeMethodId);
    if (!method) return <p className="text-center text-brand-text-secondary">الرجاء اختيار طريقة دفع.</p>;

    if (method.type === 'card') {
         return (
             <div className="space-y-4">
                <p className="text-center text-brand-text-secondary">سيتم خصم <strong className="text-brand-accent">{settings.featured_ad_price.toLocaleString()} دينار عراقي</strong> من بطاقتك.</p>
                <Input label="رقم البطاقة" placeholder="XXXX XXXX XXXX XXXX" />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="تاريخ الانتهاء" placeholder="MM/YY" />
                    <Input label="CVC" placeholder="123" />
                </div>
            </div>
        );
    }

    const details = method.details as { number?: string, account_name?: string, iban?: string };

    return (
        <div className="space-y-4 text-center">
            <p>يرجى تحويل مبلغ <strong className="text-brand-accent">{settings.featured_ad_price.toLocaleString()} دينار عراقي</strong> إلى المعلومات التالية:</p>
            {details.number && <p className="font-mono text-2xl bg-brand-primary/50 p-3 rounded-lg">{details.number}</p>}
            {details.account_name && <p>{details.account_name}</p>}
            {details.iban && <p className="font-mono">{details.iban}</p>}
            <Input label="أدخل رقم عملية التحويل للتأكيد" value={transactionId} onChange={e => setTransactionId(e.target.value)} required />
        </div>
    );
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
                <div className="flex justify-center flex-wrap gap-2 bg-brand-secondary/50 p-2 rounded-lg mb-6">
                    {activeFeatureMethods.length > 0 ? activeFeatureMethods.map(method => (
                        <button key={method.id} type="button" onClick={() => setActiveMethodId(method.id)} className={`flex-1 p-2 rounded-md flex items-center justify-center gap-2 font-bold transition-colors ${activeMethodId === method.id ? 'bg-brand-accent text-brand-primary' : 'hover:bg-brand-primary/50'}`}>
                            {method.name}
                        </button>
                    )) : <p className="text-brand-text-secondary">لا توجد طرق دفع متاحة حالياً. يرجى التواصل مع الإدارة.</p>}
                </div>
                
                {renderPaymentContent()}
                
                <div className="mt-6 flex gap-4">
                    <Button type="submit" className="w-full" disabled={!activeMethodId}>
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