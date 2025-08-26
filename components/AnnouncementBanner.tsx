
import React, { useState } from 'react';
import { AnnouncementType } from '../types';
import { InfoIcon } from './icons/InfoIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { TagIcon } from './icons/TagIcon';
import { XIcon } from './icons/XIcon';

interface AnnouncementBannerProps {
  text: string;
  type: AnnouncementType;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ text, type }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const bannerConfig = {
    info: {
      bgColor: 'bg-blue-800/80 border-blue-600',
      icon: <InfoIcon className="w-5 h-5 text-blue-300" />,
    },
    warning: {
      bgColor: 'bg-red-800/80 border-red-600',
      icon: <AlertTriangleIcon className="w-5 h-5 text-red-300" />,
    },
    offer: {
      bgColor: 'bg-emerald-800/80 border-emerald-600',
      icon: <TagIcon className="w-5 h-5 text-emerald-300" />,
    },
  };

  const { bgColor, icon } = bannerConfig[type];

  return (
    <div className={`relative w-full p-3 text-center text-sm font-medium text-white ${bgColor} backdrop-blur-sm border-b`}>
      <div className="container mx-auto flex items-center justify-center gap-3">
        {icon}
        <span>{text}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-1/2 -translate-y-1/2 left-4 p-1 rounded-full hover:bg-white/10"
          aria-label="إغلاق الإعلان"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};