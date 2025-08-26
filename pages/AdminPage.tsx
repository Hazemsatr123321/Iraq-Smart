

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { Dashboard } from '../components/admin/Dashboard';
import { UserManagement } from '../components/admin/UserManagement';
import { AdManagement } from '../components/admin/AdManagement';
import { ExternalAdManagement } from '../components/admin/ExternalAdManagement';
import { AppSettings } from '../components/admin/AppSettings';
import { ContentManagement } from '../components/admin/ContentManagement';
import { ReviewManagement } from '../components/admin/ReviewManagement';
import { FeatureManagement } from '../components/admin/FeatureManagement';
import { useUser } from '../contexts/UserContext';
import { AdminSection, UserRole } from '../types';
import { PermissionDenied } from '../components/admin/PermissionDenied';
import { FinancialsDashboard } from '../components/admin/FinancialsDashboard';
import { AITools } from '../components/admin/AITools';
import { SocialSupportManagement } from '../components/admin/SocialSupportManagement';
import { SmartSafePayManagement } from '../components/admin/SmartSafePayManagement';
import { NegotiationManagement } from '../components/admin/NegotiationManagement';

const permissions: Record<UserRole, string[]> = {
    admin: ['dashboard', 'users', 'ads', 'reviews', 'financials', 'ai_tools', 'features', 'content', 'external_ads', 'settings', 'social_support', 'smart_safepay', 'negotiations'],
    moderator: ['dashboard', 'ads', 'reviews'],
    support: ['dashboard', 'users'],
    wholesaler: [],
    retailer: [],
};

const defaultSections: Record<UserRole, string> = {
    admin: 'dashboard',
    moderator: 'ads',
    support: 'users',
    wholesaler: '', // Should not happen
    retailer: '',  // Should not happen
};


export const AdminPage: React.FC<{ onNavigate: (path: string, section?: AdminSection) => void, onLogout: () => void }> = ({ onNavigate, onLogout }) => {
    const { currentUser } = useUser();
    
    const [activeSection, setActiveSection] = useState<AdminSection | 'permission_denied'>(() => {
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        return (urlParams.get('section') as AdminSection) || (currentUser ? (defaultSections[currentUser.role] as AdminSection) : 'dashboard');
    });

    useEffect(() => {
        const handleHashChange = () => {
             const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
             const sectionFromUrl = urlParams.get('section') as AdminSection;
             if(sectionFromUrl) {
                setActiveSection(sectionFromUrl);
             }
        }
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleSelectSection = (section: string) => {
        if (currentUser && permissions[currentUser.role]?.includes(section)) {
            setActiveSection(section as AdminSection);
            onNavigate('/admin', section as AdminSection);
        } else {
            // Optionally show a notification
            console.warn(`Permission denied for section: ${section}`);
            setActiveSection('permission_denied');
        }
    };
    
    const renderContent = () => {
        if (activeSection === 'permission_denied') {
            return <PermissionDenied />;
        }

        switch (activeSection) {
            case 'dashboard': return <Dashboard />;
            case 'users': return <UserManagement onNavigate={onNavigate} />;
            case 'ads': return <AdManagement onNavigate={onNavigate}/>;
            case 'reviews': return <ReviewManagement />;
            case 'smart_safepay': return <SmartSafePayManagement />;
            case 'negotiations': return <NegotiationManagement />;
            case 'financials': return <FinancialsDashboard />;
            case 'ai_tools': return <AITools onNavigate={onNavigate} />;
            case 'social_support': return <SocialSupportManagement />;
            case 'content': return <ContentManagement />;
            case 'features': return <FeatureManagement />;
            case 'external_ads': return <ExternalAdManagement />;
            case 'settings': return <AppSettings />;
            default: return <Dashboard />;
        }
    }
    
    return (
        <div className="font-tajawal bg-brand-primary min-h-screen text-brand-text">
            <AdminHeader title="لوحة التحكم" onNavigate={onNavigate} onLogout={onLogout} />
            <div className="flex">
                <AdminSidebar activeSection={activeSection} onSelectSection={handleSelectSection} />
                <main className="flex-grow p-6 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};