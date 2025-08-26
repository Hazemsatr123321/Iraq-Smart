import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Campaign, ToastType } from '../../types';
import { ZainCashIcon } from '../icons/ZainCashIcon';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAdmin } from '../../contexts/AdminContext';
import { RibbonIcon } from '../icons/RibbonIcon';
import { CopyIcon } from '../icons/CopyIcon';
import { CheckIcon } from '../icons/CheckIcon';

// Simple placeholder for AsiaPay icon
const AsiaPayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#0072BC"/>
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">A</text>
    </svg>
);

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button type="button" onClick={handleCopy} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            {copied ? <CheckIcon className="w-5 h-5 text-green-400"/> : <CopyIcon className="w-5 h-5"/>}
        </button>
    );
};

interface DonationModalProps {
  campaign: Campaign | null;
  onClose: () => void;
  addToast: (message: string, type?: ToastType) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ campaign, onClose, addToast }) => {
  const { paymentMethods, addDonationToCampaign } = useAdmin();
  const activeDonationMethods = paymentMethods.filter(p => p.is_active_for_donations);

  const [activeMethodId, setActiveMethodId] = useState<string | null>(activeDonationMethods[0]?.id || null);
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!campaign) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const donationAmount = parseInt(amount);
    if (isNaN(donationAmount) || donationAmount < 1000) {
        addToast("الرجاء إدخال مبلغ تبرع صحيح (1,000 د.ع كحد أدنى).", "error");
        return;
    }
    if (!transactionId.trim()) {
        addToast("الرجاء إدخال رقم عملية التحويل.", "error");
        return;
    }
    
    setIsSubmitting(true);
    // Simulate API call and admin verification
    await new Promise(res => setTimeout(res, 2000));
    
    await addDonationToCampaign(campaign.id, donationAmount);

    setIsSubmitting(false);
    addToast(`شكراً لتبرعك بمبلغ ${donationAmount.toLocaleString()} د.ع! سيتم تأكيد استلامه قريباً.`, "success");
    onClose();
  };

  const renderPaymentContent = () => {
    const method = activeDonationMethods.find(m => m.id === activeMethodId);
    if (!method) return <p className="text-center text-brand-text-secondary">الرجاء اختيار طريقة دفع.</p>;

    const details = method.details as { number?: string, account_name?: string, iban?: string };
    const infoToCopy = details.number || details.iban || '';

    return (
        <div className="flex items-center justify-between bg-brand-primary/50 p-3 rounded-lg">
            <div className="text-right">
                {details.account_name && <p className="text-sm">{details.account_name}</p>}
                {details.number && <p className="font-mono text-xl text-brand-accent">{details.number}</p>}
                {details.iban && <p className="font-mono text-sm">{details.iban}</p>}
            </div>
            {infoToCopy && <CopyButton textToCopy={infoToCopy} />}
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeInUp" style={{animationDuration: '0.3s'}} onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-brand-secondary" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
            <RibbonIcon className="w-12 h-12 text-brand-accent mx-auto mb-2"/>
            <h2 className="text-2xl font-bold text-brand-text">التبرع لحملة "{campaign.title}"</h2>
            <p className="text-brand-text-secondary mb-6">مساهمتك تصنع فرقاً كبيراً.</p>
        </div>

        {isSubmitting ? (
            <LoadingSpinner text="جاري تأكيد تبرعك..." />
        ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="bg-brand-secondary p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-2">الخطوة 1: أدخل مبلغ التبرع</h3>
                    <Input label="أدخل مبلغ التبرع (د.ع)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1000" />
                </div>
                
                 <div className="bg-brand-secondary p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-2">الخطوة 2: حوّل المبلغ</h3>
                    <p className="text-sm text-brand-text-secondary mb-3">اختر إحدى الطرق التالية لتحويل المبلغ:</p>
                    <div className="flex justify-center flex-wrap gap-2 bg-brand-primary/50 p-2 rounded-lg mb-4">
                        {activeDonationMethods.length > 0 ? activeDonationMethods.map(method => (
                            <button key={method.id} type="button" onClick={() => setActiveMethodId(method.id)} className={`flex-1 p-2 rounded-md flex items-center justify-center gap-2 font-bold transition-colors ${activeMethodId === method.id ? 'bg-brand-accent text-brand-primary' : 'hover:bg-brand-primary/50'}`}>
                                {method.name}
                            </button>
                        )) : <p className="text-brand-text-secondary">لا توجد طرق دفع متاحة حالياً للتبرع.</p>}
                    </div>
                    {renderPaymentContent()}
                </div>
                
                <div className="bg-brand-secondary p-4 rounded-lg">
                     <h3 className="text-lg font-bold text-white mb-2">الخطوة 3: تأكيد التحويل</h3>
                    <Input label="أدخل رقم عملية التحويل" value={transactionId} onChange={e => setTransactionId(e.target.value)} required placeholder="معرّف العملية أو رقم هاتف المرسل"/>
                    <p className="text-xs text-brand-text-secondary mt-1 text-center">يمكنك العثور على هذا الرقم في رسالة تأكيد التحويل.</p>
                </div>
                
                 <div className="pt-2 flex flex-col sm:flex-row gap-4">
                    <Button type="submit" className="w-full" disabled={!activeMethodId}>
                        تأكيد التبرع
                    </Button>
                    <Button onClick={onClose} variant="secondary" className="w-full">إلغاء</Button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};