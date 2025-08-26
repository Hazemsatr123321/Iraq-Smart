import React from 'react';

export const AdCardSkeleton: React.FC = () => {
  return (
    <div className="bg-brand-secondary rounded-xl overflow-hidden shadow-lg border-2 border-transparent">
      <div className="relative overflow-hidden animate-pulse">
        <div className="w-full h-48 bg-gray-700"></div>
      </div>
      <div className="p-4">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
        <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-600 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};