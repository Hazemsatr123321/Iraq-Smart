import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Ad, ToastType } from '../../types';
import { useAdmin } from '../../contexts/AdminContext';
import { useUser } from '../../contexts/UserContext';
import { LoadingSpinner } from './LoadingSpinner';
import { StarIcon } from '../icons/StarIcon';

interface FeatureAdFormProps {
  ad: Ad;
  onSuccess: () => void;
  addToast: (message: string, type?: ToastType) => void;
}

const featurePackages = [
  { duration: 7, name: '7 أيام' },
  { duration: 14, name: '14 يوم' },
  { duration: 30, name: '30 يوم' },
];

export const FeatureAdForm: React.FC<FeatureAdFormProps> = ({ ad, onSuccess, addToast }) => {
  const { settings, paymentMethods } = useAdmin();
  const { featureAd, currentUser } = useUser();
  const activeFeatureMethods = paymentMethods.filter(p => p.is_active_for_features);

  const [selectedDuration, setSelectedDuration] = useState(featurePackages[0].duration);
  const [activeMethodId, setActiveMethodId] = useState<string | null>(activeFeatureMethods[0]?.id || null);
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const price = settings.featured_ad_price * selectedDuration;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMethod = activeFeatureMethods.find(m => m.id === activeMethodId);
    if (selectedMethod && selectedMethod.type !== 'card' && !transactionId.trim()) {
        addToast("الرجاء إدخال رقم عملية التحويل.", "error");
        return;
    }

    setIsSubmitting(true);
    try {
        if (currentUser && currentUser.available_feature_rewards > 0) {
            addToast('لديك مكافأة تمييز مجانية! سيتم استخدامها الآن.', 'success');
        }
        await featureAd(ad.id, selectedDuration);
        addToast("تم تمييز إعلانك بنجاح!", "success");
        onSuccess();
    } catch (error: any) {
        addToast(error.message || "فشل تمييز الإعلان.", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderPaymentContent = () => {
    const method = activeFeatureMethods.find(m => m.id === activeMethodId);
    if (!method) return <p className="text-center text-brand-text-secondary">الرجاء اختيار طريقة دفع.</p>;

    // If user has free rewards, they don't need to pay.
    if (currentUser && currentUser.available_feature_rewards > 0) {
        return <p className="text-center text-green-400 font-bold">لديك مكافأة تمييز مجانية! سيتم تطبيقها تلقائياً عند التأكيد.</p>;
    }

    if (method.type === 'card') {
         return (
             <div className="space-y-4">
                <p className="text-center text-brand-text-secondary">سيتم خصم <strong className="text-brand-accent">{price.toLocaleString()} دينار عراقي</strong> من بطاقتك.</p>
                {/* This is a placeholder UI. A real implementation would use a payment provider like Stripe. */}
                <Input label="رقم البطاقة" placeholder="XXXX XXXX XXXX XXXX" disabled/>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="تاريخ الانتهاء" placeholder="MM/YY" disabled/>
                    <Input label="CVC" placeholder="123" disabled/>
                </div>
            </div>
        );
    }

    const details = method.details as { number?: string, account_name?: string, iban?: string };

    return (
        <div className="space-y-4 text-center">
            <p>يرجى تحويل مبلغ <strong className="text-brand-accent">{price.toLocaleString()} دينار عراقي</strong> إلى المعلومات التالية:</p>
            {details.number && <p className="font-mono text-xl bg-brand-primary/50 p-2 rounded-lg">{details.number}</p>}
            {details.account_name && <p>{details.account_name}</p>}
            <Input label="أدخل رقم عملية التحويل للتأكيد" value={transactionId} onChange={e => setTransactionId(e.target.value)} required />
        </div>
    );
  }

  return (
    <div className="bg-brand-secondary rounded-lg p-4 mt-4 border border-gray-700/50">
        <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-brand-text flex items-center justify-center gap-2"><StarIcon className="w-6 h-6 text-brand-accent"/> تمييز الإعلان</h3>
            <p className="text-brand-text-secondary">اجعل إعلانك يظهر لعدد أكبر من المشترين.</p>
        </div>

        {isSubmitting ? (
            <LoadingSpinner text="جاري تمييز الإعلان..." />
        ) : (
            <form onSubmit={handleSubmit}>
                {/* Duration Selection */}
                <div className="mb-4">
                    <p className="font-bold mb-2">اختر مدة التمييز:</p>
                    <div className="flex justify-center flex-wrap gap-2">
                        {featurePackages.map(pkg => (
                             <button key={pkg.duration} type="button" onClick={() => setSelectedDuration(pkg.duration)} className={`flex-1 p-2 rounded-md font-bold transition-colors ${selectedDuration === pkg.duration ? 'bg-brand-accent text-brand-primary' : 'bg-brand-primary/50 hover:bg-brand-primary/80'}`}>
                                {pkg.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-4">
                     <p className="font-bold mb-2">اختر طريقة الدفع:</p>
                     <div className="flex justify-center flex-wrap gap-2">
                        {activeFeatureMethods.length > 0 ? activeFeatureMethods.map(method => (
                            <button key={method.id} type="button" onClick={() => setActiveMethodId(method.id)} className={`flex-1 p-2 rounded-md font-bold transition-colors ${activeMethodId === method.id ? 'bg-brand-accent text-brand-primary' : 'bg-brand-primary/50 hover:bg-brand-primary/80'}`}>
                                {method.name}
                            </button>
                        )) : <p className="text-brand-text-secondary">لا توجد طرق دفع متاحة حالياً.</p>}
                    </div>
                </div>

                {/* Payment Details */}
                <div className="my-6">
                    {renderPaymentContent()}
                </div>

                <div className="border-t border-gray-700/50 pt-4 text-center">
                     <p className="text-lg font-bold">التكلفة الإجمالية: <span className="text-brand-accent">{(currentUser && currentUser.available_feature_rewards > 0) ? 'مكافأة مجانية' : `${price.toLocaleString()} دينار عراقي`}</span></p>
                </div>

                <div className="mt-4">
                    <Button type="submit" className="w-full" disabled={!activeMethodId}>
                        تأكيد وتمييز الإعلان
                    </Button>
                </div>
            </form>
        )}
    </div>
  );
};
