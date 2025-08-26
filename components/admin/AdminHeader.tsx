import React from 'react';
import { Button } from '../common/Button';
import { useUser } from '../../contexts/UserContext';
import { LogoutIcon } from '../icons/LogoutIcon';

interface AdminHeaderProps {
    title: string;
    onNavigate: (path: string) => void;
    onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onNavigate, onLogout }) => {
    const { currentUser } = useUser();
    
    const handleLogout = () => {
        window.dispatchEvent(new CustomEvent('show-confirm', {
            detail: {
                title: 'تسجيل الخروج',
                message: 'هل أنت متأكد من تسجيل الخروج من لوحة التحكم؟',
                onConfirm: onLogout,
            }
        }));
    }

    if (!currentUser) return null; // Should not happen due to routing guards, but safe check

    return (
        <header className="bg-brand-secondary p-4 shadow-md sticky top-0 z-20">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-brand-text">{title}</h1>
                <div className="flex items-center gap-4">
                    <Button onClick={() => onNavigate('/')} variant="outline" className="!py-2 !px-4 hidden sm:block">
                        عرض التطبيق
                    </Button>
                    <div className="flex items-center gap-3">
                        <img src={currentUser.profile_picture} alt={currentUser.name} className="w-10 h-10 rounded-full border-2 border-brand-accent/50" />
                        <div className="hidden md:block">
                            <p className="font-bold text-brand-text leading-tight">{currentUser.name}</p>
                            <p className="text-xs text-brand-text-secondary leading-tight">{currentUser.role}</p>
                        </div>
                    </div>
                     <button onClick={handleLogout} className="text-brand-text-secondary hover:text-red-500 p-2 rounded-full transition-colors" title="تسجيل الخروج">
                        <LogoutIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};
