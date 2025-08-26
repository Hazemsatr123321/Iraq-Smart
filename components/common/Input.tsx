import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, icon, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={props.id} className="block text-brand-text-secondary text-sm font-bold mb-2">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">{icon}</div>}
        <input
          className="w-full bg-brand-secondary text-brand-text placeholder-brand-text-secondary border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"
          {...props}
        />
      </div>
    </div>
  );
};
