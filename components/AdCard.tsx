

import React from 'react';
import type { Ad } from '../types';
import { useUser } from '../contexts/UserContext';
import { HeartIcon } from './icons/HeartIcon';
import { useAdmin } from '../contexts/AdminContext';
import { HandHeartIcon } from './icons/HandHeartIcon';

interface AdCardProps {
  ad: Ad;
  onClick: () => void;
}

const triggerHapticFeedback = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
};

export const AdCard: React.FC<AdCardProps> = ({ ad, onClick }) => {
  const { currentUser, favorite_ad_ids, toggleFavorite } = useUser();
  const { updateAdSaves } = useAdmin();
  const isFavorite = currentUser ? favorite_ad_ids.includes(ad.id) : false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    triggerHapticFeedback();
    if (!currentUser) {
      // In a real app, you might want to show a login prompt
      console.log("User not logged in");
      return;
    }
    toggleFavorite(ad.id);
    updateAdSaves(ad.id, !isFavorite);
  };

  const handleCardClick = () => {
    triggerHapticFeedback();
    onClick();
  };

  return (
    <div onClick={handleCardClick} className="bg-brand-secondary rounded-xl overflow-hidden shadow-lg hover:shadow-brand-accent/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group border-2 border-transparent hover:border-brand-accent/30">
      <div className="relative overflow-hidden">
        <img className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" src={ad.images[0]} alt={ad.title} />
        {ad.featured && (
           <div className="absolute top-2 left-2 bg-brand-accent text-brand-primary px-3 py-1 text-sm font-bold rounded-full shadow-md z-10">
             مميز
           </div>
        )}
         {ad.is_charitable && (
           <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 text-sm font-bold rounded-full shadow-md z-10 flex items-center gap-1.5">
             <HandHeartIcon className="w-4 h-4" />
             مبادرة خيرية
           </div>
        )}
        {currentUser && (
            <button
              onClick={handleFavoriteClick}
              className={`absolute top-2 right-2 bg-brand-primary/50 backdrop-blur-sm p-2 rounded-full transition-all z-10 ${isFavorite ? 'text-brand-accent' : 'text-white'} hover:bg-brand-primary/70`}
              aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <HeartIcon className={isFavorite ? 'fill-current' : ''} />
            </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-brand-text mb-2 truncate group-hover:text-brand-accent transition-colors">{ad.title}</h3>
        <p className="text-brand-text-secondary text-sm mb-3 h-10 overflow-hidden">{ad.description}</p>
        <div className="flex justify-between items-center">
          <p className="text-brand-accent font-extrabold text-lg">{ad.price}</p>
          <span className="text-brand-text-secondary text-xs">{ad.province}</span>
        </div>
      </div>
    </div>
  );
};