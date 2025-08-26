import React from 'react';

interface EmptyStateProps {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  message: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, children }) => {
  return (
    <div className="text-center p-8 bg-brand-secondary/50 rounded-2xl border border-gray-700/50">
      <div className="w-16 h-16 mx-auto flex items-center justify-center bg-brand-primary rounded-full text-brand-accent">
        {React.cloneElement(icon, { className: 'w-8 h-8' })}
      </div>
      <h3 className="mt-6 text-2xl font-bold text-white">{title}</h3>
      <p className="mt-2 text-base text-brand-text-secondary max-w-md mx-auto">{message}</p>
      {children}
    </div>
  );
};