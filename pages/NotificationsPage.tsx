import React, { useMemo } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { Header } from '../components/Header';
import type { Notification, NotificationType } from '../types';
import { Button } from '../components/common/Button';
import { MessageSquareIcon } from '../components/icons/MessageSquareIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { useUser } from '../contexts/UserContext';

// Helper function to get icon based on notification type
const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'new_message':
            return <MessageSquareIcon className="w-6 h-6 text-blue-400" />;
        case 'new_review':
            return <StarIcon className="w-6 h-6 text-yellow-400" />;
        case 'ad_approved':
            return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-400" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
        case 'welcome':
            return <SparklesIcon className="w-6 h-6 text-brand-accent" />;
        default:
            return <div className="w-6 h-6 bg-gray-500 rounded-full" />;
    }
};

// Helper to group notifications
const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {
        'اليوم': [],
        'الأمس': [],
        'أقدم': [],
    };

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    notifications.forEach(notification => {
        const notificationDate = new Date(notification.timestamp);
        if (notificationDate.toDateString() === today.toDateString()) {
            groups['اليوم'].push(notification);
        } else if (notificationDate.toDateString() === yesterday.toDateString()) {
            groups['الأمس'].push(notification);
        } else {
            groups['أقدم'].push(notification);
        }
    });

    return groups;
};

export const NotificationsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const { notifications, markAsRead, markAllAsRead, clearAllNotifications } = useAdmin();
    const { currentUser } = useUser();
    
    const userNotifications = useMemo(() => {
        if (!currentUser) return [];
        return notifications.filter(n => n.user_id === currentUser.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [notifications, currentUser]);

    if (!currentUser) {
        onNavigate('/auth');
        return null;
    }

    const groupedNotifications = groupNotificationsByDate(userNotifications);

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        onNavigate(notification.link);
    };
    
    const handleClearAll = () => {
        window.dispatchEvent(new CustomEvent('show-confirm', {
            detail: {
                title: 'حذف جميع الإشعارات',
                message: 'هل أنت متأكد من حذف جميع الإشعارات؟ لا يمكن التراجع عن هذا الإجراء.',
                onConfirm: () => clearAllNotifications(currentUser.id),
            }
        }));
    }
    
    const handleMarkAllRead = () => {
        markAllAsRead(currentUser.id);
    }

    return (
        <div className="bg-brand-primary min-h-screen text-brand-text">
            <Header variant="page" title="الإشعارات" onBack={() => onNavigate('/')} onNavigate={onNavigate}/>
            <main className="container mx-auto p-4 pb-24">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-brand-text">قائمة الإشعارات</h1>
                    {userNotifications.length > 0 && (
                        <div className="flex gap-2">
                            <Button onClick={handleMarkAllRead} variant="secondary" className="!text-sm !py-1.5 !px-3">تعليم الكل كمقروء</Button>
                            <Button onClick={handleClearAll} variant="outline" className="!border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-brand-primary !text-sm !py-1.5 !px-3">حذف الكل</Button>
                        </div>
                    )}
                </div>
                
                {userNotifications.length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(groupedNotifications).map(([groupTitle, groupNotifications]) => (
                            groupNotifications.length > 0 && (
                                <div key={groupTitle}>
                                    <h2 className="text-lg font-semibold text-brand-text-secondary mb-3">{groupTitle}</h2>
                                    <div className="bg-brand-secondary rounded-2xl overflow-hidden space-y-px">
                                        {groupNotifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                                                    notification.is_read
                                                        ? 'bg-brand-primary/30 opacity-70'
                                                        : 'bg-brand-secondary hover:bg-brand-primary/50'
                                                }`}
                                            >
                                                <div className="flex-shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className={`text-brand-text ${!notification.is_read ? 'font-bold' : ''}`}>{notification.text}</p>
                                                    <p className="text-xs text-brand-text-secondary mt-1">{new Date(notification.timestamp).toLocaleString('ar-IQ')}</p>
                                                </div>
                                                {!notification.is_read && (
                                                    <div className="w-3 h-3 bg-brand-accent rounded-full flex-shrink-0 animate-pulse"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-brand-secondary rounded-2xl">
                        <p className="text-xl text-brand-text-secondary">لا توجد إشعارات جديدة.</p>
                    </div>
                )}
            </main>
        </div>
    );
};
