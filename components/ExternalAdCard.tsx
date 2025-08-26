

import React from 'react';
import type { ExternalAd } from '../types';

interface ExternalAdCardProps {
  ad: ExternalAd;
}

export const ExternalAdCard: React.FC<ExternalAdCardProps> = ({ ad }) => {
  return (
    <a 
      href={ad.target_url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-brand-accent/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
    >
      <div className="relative">
        <img className="w-full h-32 sm:h-40 object-cover" src={ad.image_url} alt={ad.company_name} />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
        <div className="absolute bottom-1 right-2 bg-black/60 text-white px-2 py-0.5 text-xs font-bold rounded">
            إعلان
        </div>
      </div>
    </a>
  );
};