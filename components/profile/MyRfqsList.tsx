

import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useUser } from '../../contexts/UserContext';
import { EmptyState } from '../common/EmptyState';
import { ClipboardIcon } from '../icons/ClipboardIcon';
import { Button } from '../common/Button';
import { SellerReputationBadge } from '../SellerReputationBadge';

export const MyRfqsList: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const { currentUser } = useUser();
    const { rfqs, getOffersForRfq, users, featureFlags } = useAdmin();

    if (!currentUser) return null;

    const myRfqs = rfqs.filter(r => r.user_id === currentUser.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const isSellerReputationEnabled = featureFlags.find(f => f.id === 'sellerReputation')?.is_enabled ?? false;

    if (myRfqs.length === 0) {
        return (
            <div className="py-16">
                <EmptyState
                    icon={<ClipboardIcon />}
                    title="لا توجد طلبات"
                    message="لم تقم بنشر أي طلبات عروض أسعار بعد. انشر طلباً لتحصل على عروض من تجار الجملة."
                >
                    <Button onClick={() => onNavigate('/post-rfq')} className="mt-6">
                        إنشاء طلب جديد
                    </Button>
                </EmptyState>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {myRfqs.map(rfq => {
                const offers = getOffersForRfq(rfq.id);
                return (
                    <div key={rfq.id} className="bg-brand-secondary p-5 rounded-xl shadow-lg border border-gray-700/50">
                        <div className="border-b border-gray-600 pb-4 mb-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-brand-accent">{rfq.product_name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rfq.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {rfq.status === 'open' ? 'مفتوح' : 'مغلق'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-brand-text-secondary mt-2">
                               <span>الكمية: <span className="font-bold text-white">{rfq.quantity}</span></span>
                               <span>الفئة: <span className="font-bold text-white">{rfq.category}</span></span>
                               <span>المحافظة: <span className="font-bold text-white">{rfq.province}</span></span>
                            </div>
                             <p className="text-sm text-brand-text-secondary mt-2">{rfq.details}</p>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-brand-text mb-3">العروض المستلمة ({offers.length})</h4>
                        {offers.length > 0 ? (
                            <div className="space-y-3">
                                {offers.map(offer => {
                                    const seller = users.find(u => u.id === offer.seller_id);
                                    if (!seller) return null;
                                    return (
                                        <div key={offer.id} className="bg-brand-primary/60 p-3 rounded-lg flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <img src={seller.profile_picture} alt={seller.name} className="w-10 h-10 rounded-full" />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                      <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(`/profile/${seller.id}`)}} className="font-bold hover:underline">{seller.name}</a>
                                                      {isSellerReputationEnabled && seller.reputation && <SellerReputationBadge reputation={seller.reputation} />}
                                                    </div>
                                                    <p className="text-xs text-brand-text-secondary">{offer.comments}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                               <p className="font-bold text-lg text-brand-accent">{offer.price_per_unit.toLocaleString()} د.ع</p>
                                               <p className="text-xs text-brand-text-secondary">/ للوحدة</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-brand-text-secondary text-center py-4">لم تستلم أي عروض بعد.</p>
                        )}
                    </div>
                )
            })}
        </div>
    );
};