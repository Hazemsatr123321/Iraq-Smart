

import React from 'react';
import { GridIcon } from '../icons/GridIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { FileTextIcon } from '../icons/FileTextIcon';
import { StarIcon } from '../icons/StarIcon';
import { DatabaseIcon } from '../icons/DatabaseIcon';
import { ImageIcon } from '../icons/ImageIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import { SlidersIcon } from '../icons/SlidersIcon';
import { useUser } from '../../contexts/UserContext';
import { UserRole } from '../../types';
import { DollarSignIcon } from '../icons/DollarSignIcon';
import { BotIcon } from '../icons/BotIcon';
import { HandHeartIcon } from '../icons/HandHeartIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';

interface AdminSidebarProps {
    activeSection: string;
    onSelectSection: (section: string) => void;
}

const allSections = [
    { key: 'dashboard', name: 'لوحة المعلومات', icon: <GridIcon className="w-5 h-5"/> },
    { key: 'users', name: 'إدارة المستخدمين', icon: <UsersIcon className="w-5 h-5"/> },
    { key: 'ads', name: 'إدارة الإعلانات', icon: <FileTextIcon className="w-5 h-5"/> },
    { key: 'reviews', name: 'إدارة التقييمات', icon: <StarIcon className="w-5 h-5"/> },
    { key: 'smart_safepay', name: 'المدفوعات الآمنة', icon: <ShieldCheckIcon className="w-5 h-5"/> },
    { key: 'negotiations', name: 'المفاوضات', icon: <BotIcon className="w-5 h-5"/> },
    { key: 'financials', name: 'المالية', icon: <DollarSignIcon className="w-5 h-5"/> },
    { key: 'social_support', name: 'الدعم الاجتماعي', icon: <HandHeartIcon className="w-5 h-5"/> },
    { key: 'ai_tools', name: 'أدوات الذكاء الاصطناعي', icon: <BotIcon className="w-5 h-5"/> },
    { key: 'features', name: 'إدارة الميزات', icon: <SlidersIcon className="w-5 h-5"/> },
    { key: 'content', name: 'إدارة المحتوى', icon: <DatabaseIcon className="w-5 h-5"/> },
    { key: 'external_ads', name: 'إعلانات الشركات', icon: <ImageIcon className="w-5 h-5"/> },
    { key: 'settings', name: 'إعدادات التطبيق', icon: <SettingsIcon className="w-5 h-5"/> },
];

const permissions: Record<UserRole, string[]> = {
    admin: ['dashboard', 'users', 'ads', 'reviews', 'financials', 'ai_tools', 'features', 'content', 'external_ads', 'settings', 'social_support', 'smart_safepay', 'negotiations'],
    moderator: ['dashboard', 'ads', 'reviews'],
    support: ['dashboard', 'users'],
    wholesaler: [],
    retailer: [],
};


export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, onSelectSection }) => {
    const { currentUser } = useUser();

    const visibleSections = React.useMemo(() => {
        if (!currentUser) return [];
        const userPermissions = permissions[currentUser.role] || [];
        return allSections.filter(section => userPermissions.includes(section.key));
    }, [currentUser]);

    return (
        <aside className="w-64 bg-brand-primary p-4 space-y-2 hidden md:block border-l border-brand-secondary/30">
            <h2 className="text-lg font-bold text-brand-accent mb-4 px-2">لوحة التحكم</h2>
            {visibleSections.map(section => (
                <button
                    key={section.key}
                    onClick={() => onSelectSection(section.key)}
                    className={`w-full text-right px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                        activeSection === section.key 
                        ? 'bg-brand-accent text-brand-primary shadow-lg shadow-brand-accent/20' 
                        : 'text-brand-text-secondary hover:bg-brand-secondary hover:text-brand-text'
                    }`}
                >
                    {section.icon}
                    <span>{section.name}</span>
                </button>
            ))}
        </aside>
    );
};