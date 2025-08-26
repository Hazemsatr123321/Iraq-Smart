import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import type { NegotiationSession } from '../../types';

const statusConfig: Record<NegotiationSession['status'], { text: string; color: string }> = {
    'active': { text: 'نشطة', color: 'bg-blue-500/20 text-blue-400' },
    'accepted': { text: 'تمت بنجاح', color: 'bg-green-500/20 text-green-400' },
    'rejected': { text: 'مرفوضة', color: 'bg-red-500/20 text-red-400' },
    'cancelled': { text: 'ملغاة', color: 'bg-gray-500/20 text-gray-400' },
};

export const NegotiationManagement: React.FC = () => {
    const { negotiationSessions, users, ads } = useAdmin();

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">مراقبة جلسات التفاوض ({negotiationSessions.length})</h2>
            <div className="bg-brand-secondary rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-brand-text-secondary">
                    <thead className="text-xs text-brand-text uppercase bg-brand-primary/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">الإعلان</th>
                            <th scope="col" className="px-6 py-3">الأطراف</th>
                            <th scope="col" className="px-6 py-3">الحالة</th>
                            <th scope="col" className="px-6 py-3">آخر رسالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {negotiationSessions.map(session => {
                            const ad = ads.find(a => a.id === session.ad_id);
                            const buyer = users.find(u => u.id === session.buyer_id);
                            const seller = users.find(u => u.id === session.seller_id);
                            const lastMessage = session.history[session.history.length - 1];

                            return (
                                <tr key={session.id} className="border-b border-brand-primary/50 hover:bg-brand-primary/30">
                                    <td className="px-6 py-4 font-medium text-brand-text whitespace-nowrap">{ad?.title || 'إعلان محذوف'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span>البائع: {seller?.name || 'غير معروف'}</span>
                                            <span>المشتري: {buyer?.name || 'غير معروف'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[session.status].color}`}>
                                            {statusConfig[session.status].text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-sm truncate" title={lastMessage?.text}>
                                        {lastMessage?.text || 'لا يوجد'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {negotiationSessions.length === 0 && <p className="text-center p-8">لا توجد جلسات تفاوض لعرضها.</p>}
            </div>
        </div>
    );
};