import React, { useMemo, useRef, useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { BellIcon } from './icons/BellIcon';
import { useAdmin } from '../contexts/AdminContext';
import { useUser } from '../contexts/UserContext';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onAIAssist?: () => void;
  variant?: 'home' | 'page';
  title?: string;
  onBack?: () => void;
  onNavigate?: (path: string) => void;
  onAdminAccess?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  onAIAssist, 
  variant = 'home', 
  title = "سوق العراق الذكي", 
  onBack,
  onNavigate,
  onAdminAccess
}) => {
  const [query, setQuery] = React.useState('');
  const { notifications } = useAdmin();
  const { currentUser } = useUser();
  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    return notifications.filter(n => n.user_id === currentUser.id && !n.is_read).length;
  }, [notifications, currentUser]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };
  
  const NotificationButton = () => (
     <button onClick={() => onNavigate && onNavigate('/notifications')} className="relative text-brand-text-secondary p-2 rounded-full hover:bg-brand-primary/50 transition-colors">
        <BellIcon className="w-6 h-6" />
        {currentUser && unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
        )}
      </button>
  );

  if (variant === 'page') {
    return (
      <header 
        style={{ paddingTop: 'calc(0.75rem + var(--safe-area-inset-top))' }} 
        className={`bg-brand-secondary/80 backdrop-blur-md sticky top-0 z-40 p-3 shadow-lg shadow-black/20`}
      >
        <div className="container mx-auto flex items-center justify-between gap-2">
            <div className="w-10">
                 {onBack && (
                    <button onClick={onBack} className="text-brand-text p-2 rounded-full hover:bg-brand-primary/50 transition-colors">
                      <ArrowRightIcon className="w-6 h-6" />
                    </button>
                  )}
            </div>
          <h1 className="text-xl font-bold text-brand-text truncate flex-grow text-center">
            {title}
          </h1>
           <div className="w-10 flex justify-end">
            <NotificationButton />
          </div>
        </div>
      </header>
    );
  }

  // Home variant
  return (
    <header 
      style={{ paddingTop: 'calc(1rem + var(--safe-area-inset-top))' }}
      className={`bg-transparent absolute left-0 right-0 top-0 z-40 p-4`}
    >
      <div className="container mx-auto flex justify-between items-center gap-4">
        <div 
          className="flex items-center gap-2"
        >
            <SparklesIcon className="h-8 w-8 text-brand-accent"/>
            <h1 className="text-xl md:text-2xl font-extrabold text-brand-text whitespace-nowrap">سوق العراق الذكي</h1>
        </div>
         <div className="flex items-center gap-4">
            {onNavigate && <NotificationButton />}
         </div>
      </div>
    </header>
  );
};