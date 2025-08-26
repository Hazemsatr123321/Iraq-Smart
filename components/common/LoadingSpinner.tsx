
import React from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';

interface LoadingSpinnerProps {
    text: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 text-brand-accent py-8">
            <div className="relative">
                <SparklesIcon className="w-16 h-16 animate-spin" style={{ animationDuration: '3s' }}/>
            </div>
            <p className="text-xl font-semibold animate-pulse">{text}</p>
        </div>
    );
};