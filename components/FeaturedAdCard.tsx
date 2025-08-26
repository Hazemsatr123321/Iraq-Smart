

import React from 'react';
import type { Ad, User } from '../types';
import { useUser } from '../contexts/UserContext';
import { VerifiedBadge } from './VerifiedBadge';

interface FeaturedAdCardProps {
  ad: Ad;
  seller: User | undefined;
  onClick: () => void;
}

export const FeaturedAdCard: React.FC<FeaturedAdCardProps> = ({ ad, seller, onClick }) => {
  return (
    <div 
      onClick={onClick} 
      className="bg-gradient-to-br from-brand-secondary/80 to-brand-primary/60 rounded-2xl overflow-hidden shadow-2xl shadow-black/30 backdrop-blur-sm border border-brand-accent/20 hover:border-brand-accent/50 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
    >
      <div className="relative">
        <img className="w-full h-56 object-cover" src={ad.images[0]} alt={ad.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute top-3 left-3 bg-brand-accent text-brand-primary px-3 py-1 text-sm font-bold rounded-full shadow-md z-10 animate-pulse">
            مميز
        </div>
        <div className="absolute bottom-0 p-4 w-full">
            <h3 className="font-bold text-xl text-white mb-1 truncate">{ad.title}</h3>
            <p className="text-brand-accent font-bold text-lg">{ad.price}</p>
        </div>
      </div>
      {seller && (
          <div className="p-4 bg-brand-secondary/40 flex items-center gap-3">
              <img src={seller.profile_picture} alt={seller.name} className="w-10 h-10 rounded-full border-2 border-brand-accent/50"/>
              <div>
                <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-brand-text">{seller.name}</p>
                    {seller.is_verified && <VerifiedBadge className="w-4 h-4"/>}
                </div>
                <p className="text-xs text-brand-text-secondary">{seller.store_name}</p>
              </div>
          </div>
      )}
    </div>
  );
};