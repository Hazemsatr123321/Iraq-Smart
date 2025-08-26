import React, { useMemo, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useUser } from '../contexts/UserContext';
import { Header } from '../components/Header';
import { Button } from '../components/common/Button';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { OrderEvent, SmartPayment, ToastType } from '../types';
import { AddTrackingModal } from '../components/modals/AddTrackingModal';
import { RaiseDisputeModal } from '../components/modals/RaiseDisputeModal';
import { AlertTriangleIcon } from '../components/icons/AlertTriangleIcon';

const statusConfig: Record<SmartPayment['status'], { title: string, desc: string, icon: string, color: string }> = {
    'pending_deposit': { title: 'بانتظار الإيداع', desc: 'على المشتري إيداع المبلغ.', icon: '⌛', color: 'text-yellow-400' },
    'funds_deposited': { title: 'تم الإيداع', desc: 'على البائع شحن البضاعة.', icon: '💰', color: 'text-blue-400' },
    'shipped': { title: 'تم الشحن', desc: 'على المشتري تأكيد الاستلام.', icon: '🚚', color: 'text-cyan-400' },
    'completed': { title: 'مكتملة', desc: 'تم تحرير المبلغ للبائع.', icon: '✅', color: 'text-green-400' },
    'disputed': { title: 'نزاع قائم', desc: 'تم فتح نزاع، الدفعة معلقة.', icon: '⚠️', color: 'text-red-400' },
};

const TimelineEvent: React.FC<{ event: OrderEvent, isLast: boolean }> = ({ event, isLast }) => (
    <div className="flex gap-4">
        <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-brand-primary/50 ${statusConfig[event.status].color} border-current`}>
                <span className="text-lg">{statusConfig[event.status].icon}</span>
            </div>
            {!isLast && <div className="w-0.5 flex-grow bg-gray-700"></div>}
        </div>
        <div className="pb-8">
            <h4 className={`font-bold text-white`}>{statusConfig[event.status].title}</h4>
            <p className={`text-sm text-gray-300`}>{event.description}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(event.timestamp).toLocaleString('ar-IQ')}</p>
        </div>
    </div>
);


export const SafePayPage: React.FC<{
    memoId: string;
    onNavigate: (path: string) => void;
    addToast: (message: string, type?: ToastType) => void;
}> = ({ memoId, onNavigate, addToast }) => {
    const { dealMemos, users, getSmartPaymentByMemoId, initiateSmartPayment, updateSmartPaymentStatus, addShippingInfoToPayment, raiseDispute } = useAdmin();
    const { currentUser } = useUser();
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

    const memo = useMemo(() => dealMemos.find(m => m.id === memoId), [memoId, dealMemos]);
    const payment = useMemo(() => getSmartPaymentByMemoId(memoId), [memoId, getSmartPaymentByMemoId]);

    if (!currentUser || !memo) {
        return <div>خطأ: لم يتم العثور على الاتفاق.</div>;
    }
    
    const otherPartyId = memo.approver_ids.find(id => id !== currentUser.id);
    const otherParty = users.find(u => u.id === otherPartyId);
    const isBuyer = currentUser.role === 'retailer';

    const handleInitiate = async () => {
        if (!payment) {
            const price = parseFloat(memo.price.replace(/[^0-9]/g, ''));
            const buyerId = isBuyer ? currentUser.id : otherParty!.id;
            const sellerId = isBuyer ? otherParty!.id : currentUser.id;
            await initiateSmartPayment(memo.id, buyerId, sellerId, price);
            addToast('تم إنشاء الدفعة الآمنة بنجاح.', 'success');
        }
    };

    React.useEffect(() => {
        if (memo.status === 'approved' && !payment) {
            handleInitiate();
        }
    }, [memo, payment]);

    const handleAction = (newStatus: SmartPayment['status']) => {
        if (payment) {
            updateSmartPaymentStatus(payment.id, newStatus);
            addToast('تم تحديث حالة الدفعة بنجاح.', 'success');
        }
    };

    const handleAddShipping = async (shippingInfo: { company: string; trackingNumber: string; }) => {
        if (payment) {
            await addShippingInfoToPayment(payment.id, {company: shippingInfo.company, tracking_number: shippingInfo.trackingNumber});
            addToast('تمت إضافة معلومات الشحن بنجاح.', 'success');
            setIsTrackingModalOpen(false);
        }
    };
    
    const handleRaiseDispute = async (reason: string) => {
        if (payment) {
            await raiseDispute(payment.id, reason);
            addToast('تم فتح نزاع بنجاح. ستقوم الإدارة بمراجعة الحالة.', 'success');
            setIsDisputeModalOpen(false);
        }
    };

    const renderActionButton = () => {
        if (!payment) return null;

        if (payment.status === 'disputed') {
            return (
                <div className="text-center font-bold text-red-400 p-4 bg-red-900/50 rounded-lg flex items-center gap-3">
                    <AlertTriangleIcon className="w-6 h-6 flex-shrink-0" />
                    <p>الدفعة معلقة حالياً بسبب نزاع مفتوح. ستقوم الإدارة بمراجعة الحالة قريباً.</p>
                </div>
            )
        }

        if (isBuyer && payment.status === 'pending_deposit') return <Button onClick={() => handleAction('funds_deposited')} className="w-full">إيداع المبلغ الآن</Button>
        if (!isBuyer && payment.status === 'funds_deposited') return <Button onClick={() => setIsTrackingModalOpen(true)} className="w-full">إضافة تفاصيل الشحن</Button>
        if (isBuyer && payment.status === 'shipped') return <Button onClick={() => handleAction('completed')} className="w-full">تأكيد الاستلام وتحرير المبلغ</Button>
        if (payment.status === 'completed') return <p className="text-center font-bold text-green-400 p-4 bg-green-900/50 rounded-lg">اكتملت هذه الصفقة بنجاح!</p>
        
        return null;
    }

    return (
        <div className="min-h-screen bg-brand-primary text-brand-text">
            {isTrackingModalOpen && payment && <AddTrackingModal onClose={() => setIsTrackingModalOpen(false)} onSubmit={handleAddShipping} />}
            {isDisputeModalOpen && payment && <RaiseDisputeModal onClose={() => setIsDisputeModalOpen(false)} onSubmit={handleRaiseDispute} />}
            <Header variant="page" title="مساعد الطلبات الذكي" onBack={() => onNavigate(`/chat/${memo.conversation_id}`)} onNavigate={onNavigate} />
            <main className="container mx-auto p-4 pb-24">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10">
                        <ShieldCheckIcon className="w-16 h-16 text-brand-accent mx-auto mb-4"/>
                        <h1 className="text-4xl font-extrabold text-gradient-gold">متابعة حية للطلب</h1>
                        <p className="mt-4 text-lg text-brand-text-secondary">
                            نتابع معك الصفقة خطوة بخطوة لضمان حقوق الطرفين.
                        </p>
                    </div>

                    <div className="bg-brand-secondary p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Status Tracker */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">سجل تتبع الطلب</h3>
                            {payment?.order_history.map((event, index) => (
                                <TimelineEvent key={event.timestamp} event={event} isLast={index === payment.order_history.length - 1} />
                            ))}
                        </div>

                        {/* Details and Actions */}
                        <div className="bg-brand-primary/50 p-6 rounded-lg space-y-4 self-start">
                            <h3 className="text-xl font-bold border-b border-gray-600 pb-2">تفاصيل الصفقة</h3>
                            <div className="flex justify-between"><span className="text-gray-400">المنتج:</span><span className="font-bold">{memo.product}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">السعر:</span><span className="font-bold text-brand-accent">{memo.price}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">الطرف الآخر:</span><span className="font-bold">{otherParty?.name}</span></div>
                            {payment?.shipping_info && (
                                <>
                                <div className="flex justify-between"><span className="text-gray-400">شركة الشحن:</span><span className="font-bold">{payment.shipping_info.company}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">رقم التتبع:</span><span className="font-bold">{payment.shipping_info.tracking_number}</span></div>
                                </>
                            )}
                            <div className="pt-4 border-t border-gray-600 space-y-3">
                                {renderActionButton()}
                                {isBuyer && payment?.status === 'shipped' && (
                                    <Button onClick={() => setIsDisputeModalOpen(true)} variant="outline" className="w-full !border-red-500 !text-red-400 hover:!bg-red-500 hover:!text-white">
                                        فتح نزاع
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};