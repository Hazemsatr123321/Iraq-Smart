
import React from 'react';

export const BotIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="7" y="12" width="10" height="8" rx="2" />
        <path d="M12 12v-2" />
        <path d="M12 8V4H8" />
        <path d="M16 4h-4" />
        <circle cx="9" cy="16" r="1" />
        <circle cx="15" cy="16" r="1" />
    </svg>
);