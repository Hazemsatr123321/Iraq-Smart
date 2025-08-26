
import React from 'react';
import type { AdLinkDetails } from '../types';

interface AdLinkMessageCardProps {
  adDetails: AdLinkDetails;
  onNavigate: (path: string) => void;
}

export const AdLinkMessageCard: React.FC<AdLinkMessageCardProps> = ({ adDetails, onNavigate }) => {
  return (
    <div className="flex justify-center my-4">
      <div
        onClick={() => onNavigate(`/ad/${adDetails.ad_id}`)}
        className="bg-brand-secondary rounded-lg w-full max-w-sm p-3 border border-gray-700 cursor-pointer hover:border-brand-accent transition-colors shadow-lg"
      >
        <p className="text-center text-xs text-brand-text-secondary mb-2">بدأت المحادثة بخصوص الإعلان التالي:</p>
        <div className="flex items-center gap-3">
          <img src={adDetails.image} alt={adDetails.title} className="w-16 h-16 object-cover rounded-md" />
          <div className="flex-grow">
            <p className="font-bold text-brand-text leading-tight">{adDetails.title}</p>
            <p className="text-sm text-brand-accent mt-1">{adDetails.price}</p>
          </div>
        </div>
      </div>
    </div>
  );
};