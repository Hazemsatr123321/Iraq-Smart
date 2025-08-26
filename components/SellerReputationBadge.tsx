
import React from 'react';
import { UserReputation } from '../types';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface SellerReputationBadgeProps {
  reputation: UserReputation;
  className?: string;
}

const reputationConfig: Record<UserReputation, { label: string; color: string; icon: JSX.Element }> = {
  'New Seller': { label: 'بائع جديد', color: 'border-gray-500 text-gray-400', icon: <SparklesIcon className="w-3 h-3"/> },
  'Rising Star': { label: 'نجم صاعد', color: 'border-cyan-500 text-cyan-400', icon: <TrendingUpIcon className="w-3 h-3"/> },
  'Trusted Seller': { label: 'تاجر موثوق', color: 'border-green-500 text-green-400', icon: <ShieldCheckIcon className="w-3 h-3"/> },
  'Verified Pro': { label: 'محترف معتمد', color: 'border-yellow-500 text-yellow-400', icon: <ShieldCheckIcon className="w-3 h-3"/> },
};

export const SellerReputationBadge: React.FC<SellerReputationBadgeProps> = ({ reputation, className = '' }) => {
  const config = reputationConfig[reputation];
  if (!config) return null;

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-0.5 border rounded-full text-xs font-bold ${config.color} bg-black/20 ${className}`}
      title={`سمعة التاجر: ${config.label}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};
