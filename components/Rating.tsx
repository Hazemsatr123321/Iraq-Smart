
import React from 'react';
import { StarIcon } from './icons/StarIcon';

interface RatingProps {
  rating: number;
  totalStars?: number;
  className?: string;
  starClassName?: string;
}

export const Rating: React.FC<RatingProps> = ({ rating, totalStars = 5, className = '', starClassName = 'w-5 h-5' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(totalStars)].map((_, index) => {
        const starNumber = index + 1;
        return (
          <StarIcon
            key={starNumber}
            className={`${starClassName} ${starNumber <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
          />
        );
      })}
    </div>
  );
};