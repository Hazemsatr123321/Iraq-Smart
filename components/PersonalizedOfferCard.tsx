
import React from 'react';
import type { Ad, PersonalizedOffer } from '../types';
import { TargetIcon } from './icons/TargetIcon';

interface PersonalizedOfferCardProps {
  ad: Ad;
  offer: PersonalizedOffer;
  onClick: () => void;
}

export const PersonalizedOfferCard: React.FC<PersonalizedOfferCardProps> = ({ ad, offer, onClick }) => {
  // Extract the numeric part of the price
  const basePrice = parseFloat(ad.price.replace(/[^0-9]/g, ''));
  const newPrice = basePrice * (1 - offer.discount_percentage / 100);

  return (
    <div 
      onClick={onClick} 
      className="bg-gradient-to-br from-emerald-900/50 to-brand-primary/60 rounded-2xl overflow-hidden shadow-2xl shadow-black/30 backdrop-blur-sm border border-emerald-500/30 hover:border-emerald-500/70 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
    >
      <div className="relative">
        <img className="w-full h-48 object-cover" src={ad.images[0]} alt={ad.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1 text-sm font-bold rounded-full shadow-md z-10 flex items-center gap-1.5">
            <TargetIcon className="w-4 h-4"/>
            عرض خاص لك
        </div>
        <div className="absolute bottom-0 p-4 w-full">
            <h3 className="font-bold text-xl text-white mb-1 truncate">{ad.title}</h3>
            <div className="flex items-baseline gap-2">
                <p className="text-emerald-400 font-bold text-2xl">{newPrice.toLocaleString()} د.ع</p>
                <p className="text-gray-400 line-through text-md">{basePrice.toLocaleString()} د.ع</p>
            </div>
        </div>
      </div>
      <div className="p-4 bg-emerald-900/40">
        <p className="text-center font-bold text-emerald-300">خصم {offer.discount_percentage}%! ينتهي قريباً.</p>
      </div>
    </div>
  );
};