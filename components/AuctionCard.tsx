
import React, { useState, useEffect } from 'react';
import type { Ad, Auction, User } from '../types';
import { VerifiedBadge } from './VerifiedBadge';
import { GavelIcon } from './icons/GavelIcon';

interface AuctionCardProps {
  ad: Ad;
  auction: Auction;
  seller: User | undefined;
  onClick: () => void;
}

const Countdown: React.FC<{ endTime: string }> = ({ endTime }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endTime) - +new Date();
        if (difference <= 0) return 'انتهى';

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);

        if (days > 0) return `${days} يوم متبقي`;
        if (hours > 0) return `${hours} ساعة متبقية`;
        return `${minutes} دقيقة متبقية`;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (timeLeft === 'انتهى') return;
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Update every minute
        return () => clearTimeout(timer);
    }, [timeLeft]);

    return <span className="text-xs font-bold text-red-400">{timeLeft}</span>;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ ad, auction, seller, onClick }) => {
  return (
    <div onClick={onClick} className="bg-brand-secondary rounded-xl overflow-hidden shadow-lg hover:shadow-brand-accent/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group border-2 border-transparent hover:border-red-500/30">
      <div className="relative overflow-hidden">
        <img className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" src={ad.images[0]} alt={ad.title} />
         <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded-full shadow-md z-10 flex items-center gap-1">
            <GavelIcon className="w-4 h-4"/>
             مزاد
           </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-brand-text mb-2 truncate group-hover:text-brand-accent transition-colors">{ad.title}</h3>
        
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-brand-text-secondary">السعر الحالي</p>
            <p className="text-brand-accent font-extrabold text-lg">{auction.current_price.toLocaleString()} د.ع</p>
          </div>
          <Countdown endTime={auction.end_time} />
        </div>

        {seller && (
            <div className="border-t border-gray-700 pt-3 flex items-center gap-2">
                <img src={seller.profile_picture} alt={seller.name} className="w-8 h-8 rounded-full"/>
                <div>
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-brand-text">{seller.name}</p>
                        {seller.is_verified && <VerifiedBadge className="w-4 h-4"/>}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};