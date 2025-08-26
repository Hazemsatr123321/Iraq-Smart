import React from 'react';
import { Campaign } from '../types';
import { Button } from './common/Button';
import { UsersIcon } from './icons/UsersIcon';

interface CampaignCardProps {
  campaign: Campaign;
  onDonate: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onDonate }) => {
  const progress = (campaign.current_amount / campaign.goal_amount) * 100;

  return (
    <div className="bg-brand-primary/50 rounded-2xl overflow-hidden shadow-lg border border-gray-700/50 flex flex-col hover:border-brand-accent/50 transition-colors duration-300">
      <img className="w-full h-56 object-cover" src={campaign.image_url} alt={campaign.title} />
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-xl text-white mb-2">{campaign.title}</h3>
        <p className="text-brand-text-secondary text-sm mb-4 flex-grow">{campaign.description}</p>
        
        <div className="mb-4">
            <div className="w-full bg-gray-700 rounded-full h-4 relative">
                 <div className="bg-gradient-to-r from-yellow-500 to-brand-accent h-4 rounded-full flex items-center justify-center" style={{ width: `${Math.min(progress, 100)}%` }}>
                    <span className="text-xs font-bold text-black/70">{Math.round(progress)}%</span>
                </div>
            </div>
             <div className="flex justify-between items-center text-xs mt-1.5">
                <span className="text-brand-text-secondary">
                    المجموع: <span className="font-bold text-white">{campaign.current_amount.toLocaleString()} د.ع</span>
                </span>
                <span className="text-brand-text-secondary">
                    الهدف: <span className="font-bold text-white">{campaign.goal_amount.toLocaleString()} د.ع</span>
                </span>
            </div>
        </div>
        
        <div className="border-t border-b border-gray-700/50 my-4 py-3 text-center">
            <p className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                <UsersIcon className="w-6 h-6 text-brand-accent"/>
                {campaign.donors.toLocaleString()}
            </p>
            <p className="text-sm text-brand-text-secondary mt-1">متبرع كريم ساهم في هذه الحملة</p>
        </div>
        
        <Button onClick={() => onDonate(campaign)} className="w-full mt-auto">
          تبرع الآن
        </Button>
      </div>
    </div>
  );
};