
import React from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { UserIcon } from './icons/UserIcon';
import { MessageSquareIcon } from './icons/MessageSquareIcon';
import { GridIcon } from './icons/GridIcon';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import { HomeIcon } from './icons/HomeIcon';
import { LayoutDashboardIcon } from './icons/LayoutDashboardIcon';


interface BottomNavProps {
  onNavigate: (path: string) => void;
  activePath: string;
}

const triggerHapticFeedback = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
};

const NavItem: React.FC<{icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void}> = ({ icon, label, isActive, onClick }) => {
  const activeClass = isActive ? 'text-brand-accent' : 'text-brand-text-secondary';
  const handleClick = () => {
    triggerHapticFeedback();
    onClick();
  };
  return (
    <button onClick={handleClick} className={`flex flex-col items-center gap-1 transition-colors duration-200 hover:text-brand-accent ${activeClass} w-16`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

export const BottomNav: React.FC<BottomNavProps> = ({ onNavigate, activePath }) => {
  const { unreadCount: unreadChatCount } = useChat();
  const { currentUser } = useUser();

  const handleProfileClick = () => {
    if (currentUser) {
        onNavigate(`/account`);
    } else {
        onNavigate('/auth');
    }
  };

  const handleProtectedClick = (path: string) => {
      if(currentUser) {
          onNavigate(path);
      } else {
          onNavigate('/auth');
      }
  };

  const handlePostAdClick = () => {
    triggerHapticFeedback();
    if (currentUser && (currentUser.role === 'wholesaler' || currentUser.role === 'admin' || currentUser.role === 'retailer')) {
      onNavigate('/post');
    } else {
      onNavigate('/auth');
    }
  };


  const isAdmin = currentUser && ['admin', 'moderator', 'support'].includes(currentUser.role);

  return (
    <footer 
      style={{ paddingBottom: 'var(--safe-area-inset-bottom)' }}
      className="fixed bottom-0 left-0 right-0 bg-brand-primary border-t border-brand-secondary/50 shadow-lg z-40 md:hidden"
    >
      <div className="container mx-auto h-16 flex justify-around items-center px-2">
        <NavItem 
          icon={<HomeIcon className="w-6 h-6" />}
          label="الرئيسية"
          isActive={activePath === '/'}
          onClick={() => onNavigate('/')}
        />
        <NavItem
            icon={<GridIcon className="w-6 h-6" />}
            label="الإعلانات"
            isActive={activePath.startsWith('/ads')}
            onClick={() => onNavigate('/ads')}
        />

        { !isAdmin && (
            <button
                onClick={handlePostAdClick}
                className="bg-brand-accent text-brand-primary rounded-full w-14 h-14 flex items-center justify-center -mt-8 shadow-lg shadow-brand-accent/30 transform transition-transform active:scale-90 border-4 border-brand-primary"
                aria-label="إضافة إعلان"
            >
                <PlusIcon className="w-8 h-8"/>
            </button>
        )}

        { isAdmin && (
            <div className="-mt-8">
                 <NavItem
                    icon={<LayoutDashboardIcon className="w-8 h-8 p-1 bg-brand-accent text-brand-primary rounded-full" />}
                    label="المدير"
                    isActive={activePath.startsWith('/admin')}
                    onClick={() => onNavigate('/admin')}
                />
            </div>
        )}


        <NavItem 
            icon={
                <div className="relative">
                    <MessageSquareIcon className="w-6 h-6" />
                    {currentUser && unreadChatCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white border-2 border-brand-primary">
                            {unreadChatCount}
                        </span>
                    )}
                </div>
            }
            label="الرسائل"
            isActive={activePath.startsWith('/chat')}
            onClick={() => handleProtectedClick('/chat')}
        />
        <NavItem 
          icon={<UserIcon className="w-6 h-6" />}
          label={currentUser ? "حسابي" : "دخول"}
          isActive={activePath.startsWith('/profile') || activePath.startsWith('/auth') || activePath.startsWith('/account')}
          onClick={handleProfileClick}
        />
      </div>
    </footer>
  );
};
