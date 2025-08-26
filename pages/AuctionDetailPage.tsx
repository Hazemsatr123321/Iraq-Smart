import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useUser } from '../contexts/UserContext';
import { Header } from '../components/Header';
import { Button } from '../components/common/Button';
import { PlaceBidModal } from '../components/modals/PlaceBidModal';
import { VerifiedBadge } from '../components/VerifiedBadge';
import type { ToastType } from '../types';

const Countdown: React.FC<{ endTime: string }> = ({ endTime }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endTime) - +new Date();
        let timeLeft: { [key: string]: number } = {};
        if (difference > 0) {
            timeLeft = {
                أيام: Math.floor(difference / (1000 * 60 * 60 * 24)),
                ساعات: Math.floor((difference / (1000 * 60 * 60)) % 24),
                دقائق: Math.floor((difference / 1000 / 60) % 60),
                ثواني: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });
    
    const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
        if(value <= 0 && interval !== 'ثواني') return null;
        return (
             <div key={interval} className="flex flex-col items-center bg-brand-primary/50 px-3 py-2 rounded-lg">
                <span className="text-3xl font-bold text-brand-accent">{value.toString().padStart(2, '0')}</span>
                <span className="text-xs text-brand-text-secondary">{interval}</span>
            </div>
        )
    }).filter(Boolean);


    return (
        <div className="flex justify-center gap-2">
            {timerComponents.length ? timerComponents : <span className="text-2xl font-bold text-red-500">انتهى المزاد!</span>}
        </div>
    );
};

export const AuctionDetailPage: React.FC<{ auctionId: string; onNavigate: (path: string) => void; addToast: (message: string, type?: ToastType) => void; }> = ({ auctionId, onNavigate, addToast }) => {
    const { getAuctionById, getAdById, users, placeBid } = useAdmin();
    const { currentUser } = useUser();
    const [isBidModalOpen, setBidModalOpen] = useState(false);

    const auction = getAuctionById(auctionId);
    const ad = auction ? getAdById(auction.ad_id) : undefined;
    const seller = ad ? users.find(u => u.id === ad.user_id) : undefined;
    
    if (!auction || !ad || !seller) {
        return <div className="text-center p-8">المزاد غير موجود.</div>;
    }

    const handlePlaceBid = (amount: number) => {
        if (!currentUser) {
            addToast("يجب تسجيل الدخول للمزايدة.", "error");
            onNavigate('/auth');
            return;
        }
        try {
            placeBid(auction.id, amount, currentUser.id);
            addToast("تم وضع مزايدتك بنجاح!", "success");
            setBidModalOpen(false);
        } catch (error: any) {
            addToast(error.message, "error");
        }
    };

    const isMyAuction = currentUser?.id === seller.id;
    const canBid = currentUser && !isMyAuction;
    const latestBidderId = auction.bids.length > 0 ? auction.bids[auction.bids.length - 1].user_id : null;


    return (
        <div className="bg-brand-primary min-h-screen text-brand-text">
            <Header variant="page" title={`مزاد: ${ad.title}`} onBack={() => onNavigate('/auctions')} onNavigate={onNavigate} />
            <main className="container mx-auto p-4 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Image and Details */}
                    <div>
                        <img src={ad.images[0]} alt={ad.title} className="w-full h-80 object-cover rounded-2xl mb-6 shadow-lg" />
                        <div className="bg-brand-secondary p-6 rounded-2xl">
                             <h2 className="text-3xl font-bold text-brand-text mb-2">{ad.title}</h2>
                             <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm text-brand-text-secondary">{ad.province} - {ad.category}</span>
                             </div>
                             <p className="text-brand-text-secondary leading-relaxed whitespace-pre-line">{ad.description}</p>
                        </div>
                    </div>
                    {/* Right Column: Bidding Info */}
                    <div className="space-y-6">
                        <div className="bg-brand-secondary p-6 rounded-2xl text-center shadow-lg">
                            <h3 className="text-xl text-brand-text-secondary mb-2">الوقت المتبقي</h3>
                            <Countdown endTime={auction.end_time} />
                        </div>
                        <div className="bg-brand-secondary p-6 rounded-2xl text-center">
                            <h3 className="text-xl text-brand-text-secondary mb-2">السعر الحالي</h3>
                            <p className="text-5xl font-extrabold text-brand-accent">{auction.current_price.toLocaleString()}</p>
                            <p className="text-brand-text-secondary mt-1">دينار عراقي</p>
                            {canBid && (
                                <Button onClick={() => setBidModalOpen(true)} className="w-full mt-6 !text-lg !py-3">
                                    زايد الآن
                                </Button>
                            )}
                            {isMyAuction && <p className="mt-4 text-yellow-400">هذا مزادك. لا يمكنك المزايدة.</p>}
                             {!currentUser && <p className="mt-4 text-yellow-400">يجب تسجيل الدخول للمزايدة.</p>}
                        </div>
                        <div className="bg-brand-secondary p-6 rounded-2xl">
                             <h3 className="text-xl font-bold mb-4">سجل المزايدات ({auction.bids.length})</h3>
                             <div className="space-y-3 max-h-60 overflow-y-auto">
                                {[...auction.bids].reverse().map((bid, index) => {
                                    const bidder = users.find(u => u.id === bid.user_id);
                                    const isHighest = index === 0;
                                    return (
                                        <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${isHighest ? 'bg-green-900/50' : 'bg-brand-primary/50'}`}>
                                            <div className="flex items-center gap-3">
                                                <img src={bidder?.profile_picture} className="w-8 h-8 rounded-full" />
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-bold text-brand-text">{bidder?.name || 'مستخدم'}</span>
                                                        {bidder?.is_verified && <VerifiedBadge className="w-4 h-4" />}
                                                    </div>
                                                    <span className="text-xs text-brand-text-secondary">{new Date(bid.timestamp).toLocaleTimeString('ar-IQ')}</span>
                                                </div>
                                            </div>
                                            <span className={`font-bold text-lg ${isHighest ? 'text-green-400' : 'text-brand-text'}`}>{bid.amount.toLocaleString()}</span>
                                        </div>
                                    )
                                })}
                                {auction.bids.length === 0 && <p className="text-center text-brand-text-secondary">كن أول من يزايد!</p>}
                             </div>
                        </div>
                    </div>
                </div>
            </main>
            {isBidModalOpen && (
                 <PlaceBidModal
                    currentPrice={auction.current_price}
                    onClose={() => setBidModalOpen(false)}
                    onSubmit={handlePlaceBid}
                 />
            )}
        </div>
    )
}