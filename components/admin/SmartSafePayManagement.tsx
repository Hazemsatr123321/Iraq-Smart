import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import type { SmartPayment } from '../../types';

const statusConfig: Record<SmartPayment['status'], { text: string; color: string }> = {
    'pending_deposit': { text: 'بانتظار الإيداع', color: 'bg-yellow-500/20 text-yellow-400' },
    'funds_deposited': { text: 'تم الإيداع', color: 'bg-blue-500/20 text-blue-400' },
    'shipped': { text: 'تم الشحن', color: 'bg-cyan-500/20 text-cyan-400' },
    'completed': { text: 'مكتملة', color: 'bg-green-500/20 text-green-400' },
    'disputed': { text: 'نزاع قائم', color: 'bg-red-500/20 text-red-400' },
};

export const SmartSafePayManagement: React.FC = () => {
    const { smartPayments, users, dealMemos, resolveDispute } = useAdmin();
    
    const handleResolve = (paymentId: string, resolution: 'refund' | 'payout') => {
        const actionText = resolution === 'refund' ? 'إعادة المبلغ للمشتري' : 'تحرير المبلغ للبائع';
        window.dispatchEvent(new CustomEvent('show-confirm', {
            detail: {
                title: 'حل النزاع',
                message: `هل أنت متأكد من هذا الإجراء؟ (${actionText})`,
                onConfirm: () => resolveDispute(paymentId, resolution),
            }
        }));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">إدارة المدفوعات الآمنة ({smartPayments.length})</h2>
            <div className="bg-brand-secondary rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-brand-text-secondary">
                    <thead className="text-xs text-brand-text uppercase bg-brand-primary/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">المنتج</th>
                            <th scope="col" className="px-6 py-3">الأطراف</th>
                            <th scope="col" className="px-6 py-3">المبلغ</th>
                            <th scope="col" className="px-6 py-3">الحالة</th>
                            <th scope="col" className="px-6 py-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {smartPayments.map(payment => {
                            const memo = dealMemos.find(m => m.id === payment.memo_id);
                            const buyer = users.find(u => u.id === payment.buyer_id);
                            const seller = users.find(u => u.id === payment.seller_id);
                            return (
                                <tr key={payment.id} className="border-b border-brand-primary/50 hover:bg-brand-primary/30">
                                    <td className="px-6 py-4 font-medium text-brand-text whitespace-nowrap">{memo?.product || 'منتج محذوف'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span>البائع: {seller?.name || 'غير معروف'}</span>
                                            <span>المشتري: {buyer?.name || 'غير معروف'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-brand-accent">{payment.amount.toLocaleString()} د.ع</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[payment.status].color}`}>
                                            {statusConfig[payment.status].text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {payment.status === 'disputed' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleResolve(payment.id, 'payout')} className="font-medium rounded px-3 py-1 text-sm text-green-400 hover:bg-green-500/10">دفع للبائع</button>
                                                <button onClick={() => handleResolve(payment.id, 'refund')} className="font-medium rounded px-3 py-1 text-sm text-yellow-400 hover:bg-yellow-500/10">إرجاع للمشتري</button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-500">لا يوجد إجراء</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {smartPayments.length === 0 && <p className="text-center p-8">لا توجد عمليات دفع آمنة لعرضها.</p>}
            </div>
        </div>
    );
};
