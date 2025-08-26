import React from 'react';

const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  isLoading?: boolean;
}

const triggerHapticFeedback = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10); // A short vibration for a tap-like feedback
  }
};

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', onClick, isLoading = false, ...props }) => {
  const baseStyle = 'px-6 py-2.5 rounded-lg font-bold text-center transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';
  
  const variantStyles = {
    primary: 'bg-brand-accent text-brand-primary hover:bg-brand-accent-hover',
    secondary: 'bg-brand-secondary text-brand-text hover:bg-gray-600',
    outline: 'bg-transparent border-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-primary',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHapticFeedback();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} onClick={handleClick} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <Spinner /> : children}
    </button>
  );
};
