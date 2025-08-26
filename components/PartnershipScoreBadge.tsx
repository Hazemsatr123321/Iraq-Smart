import React from 'react';
import { PartnershipScore } from '../types';
import { HandshakeIcon } from './icons/HandshakeIcon';

interface PartnershipScoreBadgeProps {
  scoreData: PartnershipScore;
  className?: string;
}

const getScoreColor = (score: number): string => {
  if (score > 80) return 'border-green-500 text-green-400';
  if (score > 50) return 'border-cyan-500 text-cyan-400';
  return 'border-gray-500 text-gray-400';
};

export const PartnershipScoreBadge: React.FC<PartnershipScoreBadgeProps> = ({ scoreData, className = '' }) => {
  const { score, analysis } = scoreData;

  return (
    <div
      className={`relative group flex items-center gap-1.5 px-2 py-0.5 border rounded-full text-xs font-bold ${getScoreColor(score)} bg-black/20 ${className}`}
    >
      <HandshakeIcon className="w-3 h-3"/>
      <span>{score}/100</span>
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-brand-primary border border-gray-600 rounded-lg shadow-lg text-sm font-normal text-brand-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        <h4 className="font-bold text-brand-accent mb-1">تحليل الشراكة</h4>
        <p>{analysis}</p>
        <div className="w-full bg-gray-600 rounded-full h-1.5 mt-2">
            <div className="bg-current h-1.5 rounded-full" style={{ width: `${score}%` }}></div>
        </div>
      </div>
    </div>
  );
};