
import React from 'react';

export const TabButton: React.FC<{
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ children, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`py-3 px-2 md:px-4 flex items-center gap-2 text-base md:text-lg font-bold transition-colors border-b-2 ${isActive ? 'text-brand-accent border-brand-accent' : 'text-brand-text-secondary border-transparent hover:text-brand-accent'}`}
    >
      {children}
    </button>
);
