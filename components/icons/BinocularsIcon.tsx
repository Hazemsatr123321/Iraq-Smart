
import React from 'react';

export const BinocularsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="5.5" cy="11.5" r="3.5"/>
        <circle cx="18.5" cy="11.5" r="3.5"/>
        <line x1="5.5" y1="15" x2="5.5" y2="18"/>
        <line x1="18.5" y1="15" x2="18.5" y2="18"/>
        <path d="m3 11 2.5 3 2.5-3"/>
        <path d="m21 11-2.5 3-2.5-3"/>
    </svg>
);