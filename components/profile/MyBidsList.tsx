import React, { useMemo } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useUser } from '../../contexts/UserContext';
import { EmptyState } from '../common/EmptyState';
import { GavelIcon } from '../icons/GavelIcon';
import { Button } from '../common/Button';

export const MyBidsList: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const { currentUser } = useUser();
    const { auctions, offers, ads, rfqs } = useAdmin();

    if (!currentUser) return null;

    const combinedList = useMemo(() => {
        const myBidsOnAuctions = auctions
            .filter(auc => auc.bids.some(bid => bid.user_id === currentUser.id))
            .map(auc => {
                const myLastBid = [...auc.bids].reverse().find(bid => bid.user_id === currentUser.id);
                const ad = ads.find(a => a.id === auc.ad_id);
                const isHighestBidder = auc.bids.length > 0 && auc.bids[auc.bids.length - 1].user_id === currentUser.id;
                return {
                    type: 'auction',
                    id: `bid-${auc.id}`,
                    timestamp: myLastBid!.timestamp,
                    title: ad?.title || 'إعلان محذوف',
                    amount: myLastBid!.amount,
                    status: auc.status === 'ended' ? 'المزاد انتهى' : (isHighestBidder ? 'الأعلى حالياً' : 'تم المزايدة عليك'),
                    statusColor: auc.status === 'ended' ? 'text-gray-400' : (isHighestBidder ? 'text-green-400' : 'text-yellow-400'),
                    link: `/auction/${auc.id}`
                };
            });

        const myOffersOnRfqs = offers
            .filter(offer => offer.seller_id === currentUser.id)
            .map(offer => {
                const rfq = rfqs.find(r => r.id === offer.rfq_id);
                return {
                    type: 'rfq',
                    id: `offer-${offer.id}`,
                    timestamp: offer.timestamp,
                    title: rfq?.product_name || 'طلب محذوف',
                    amount: offer.price_per_unit,
                    status: rfq?.status === 'closed' ? 'الطلب مغلق' : 'العرض مقدّم',
                    statusColor: rfq?.status === 'closed' ? 'text-gray-400' : 'text-blue-400',
                    link: `/rfqs` // No specific detail page for one RFQ yet
                };
            });

        return [...myBidsOnAuctions, ...myOffersOnRfqs]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    }, [currentUser, auctions, offers, ads, rfqs]);

    if (combinedList.length === 0) {
        return (
            <div className="py-16">
                <EmptyState
                    icon={<GavelIcon />}
                    title="لا توجد عروض أو مزايدات"
                    message="هنا ستظهر جميع عروض الأسعار التي قدمتها والمزادات التي شاركت فيها."
                >
                   <div className="flex gap-4 mt-6">
                        <Button onClick={() => onNavigate('/rfqs')}>تصفح طلبات الأسعار</Button>
                        <Button onClick={() => onNavigate('/auctions')} variant="secondary">تصفح المزادات</Button>
                   </div>
                </EmptyState>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            {combinedList.map(item => (
                <div key={item.id} onClick={() => onNavigate(item.link)} className="bg-brand-secondary p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-brand-primary/50 transition-colors">
                    <div className="flex-grow">
                        <p className="font-bold text-lg text-brand-text">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-brand-text-secondary">
                              {item.type === 'auction' ? 'مزايدتك:' : 'عرضك:'}
                            </span>
                             <span className="font-bold text-brand-accent">{item.amount.toLocaleString()} د.ع</span>
                        </div>
                    </div>
                     <div className="text-right">
                        <p className={`font-bold text-sm ${item.statusColor}`}>{item.status}</p>
                        <p className="text-xs text-brand-text-secondary mt-1">{new Date(item.timestamp).toLocaleDateString('ar-IQ')}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};