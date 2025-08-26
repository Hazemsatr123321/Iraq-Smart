
import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Button } from '../common/Button';
import { BotIcon } from '../icons/BotIcon';
import { AlertTriangleIcon } from '../icons/AlertTriangleIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

const priorityConfig = {
    high: { text: 'عالية', color: 'text-red-400', bg: 'bg-red-500/20' },
    medium: { text: 'متوسطة', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    low: { text: 'منخفضة', color: 'text-blue-400', bg: 'bg-blue-500/20' },
};

export const AITools: React.FC<{onNavigate: (path: string) => void}> = ({ onNavigate }) => {
    const { suspiciousActivities, scanForSuspiciousActivity, users } = useAdmin();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleScan = async () => {
        setIsLoading(true);
        await scanForSuspiciousActivity();
        setIsLoading(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-brand-text flex items-center gap-3"><BotIcon className="w-8 h-8"/>أدوات الذكاء الاصطناعي</h2>
                 <Button onClick={handleScan} disabled={isLoading} className="flex items-center gap-2">
                    {isLoading ? 'جاري الفحص...' : <><SparklesIcon className="w-5 h-5"/> فحص جديد</>}
                 </Button>
            </div>
            <p className="text-brand-text-secondary mb-8 max-w-3xl">
                استخدم قوة الذكاء الاصطناعي لمراقبة وحماية السوق. يقوم النظام تلقائياً برصد الأنشطة التي قد تكون مخالفة أو احتيالية.
            </p>

            <div className="bg-brand-secondary rounded-lg shadow-lg">
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold">سجل الأنشطة المشبوهة</h3>
                </div>
                <div className="space-y-2 p-4">
                    {suspiciousActivities.map(activity => {
                         const relatedUser = activity.related_user_id ? users.find(u => u.id === activity.related_user_id) : null;
                        const priority = priorityConfig[activity.priority];
                        return (
                            <div key={activity.id} className={`p-4 rounded-lg flex items-start gap-4 ${priority.bg}`}>
                                <AlertTriangleIcon className={`w-6 h-6 flex-shrink-0 mt-1 ${priority.color}`} />
                                <div className="flex-grow">
                                    <p className="text-brand-text">{activity.description}</p>
                                    <div className="flex items-center gap-4 text-xs mt-2">
                                        {relatedUser && (
                                            <span className="text-gray-300">
                                                المستخدم: <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(`/profile/${relatedUser.id}`)}} className="font-bold hover:underline">{relatedUser.name}</a>
                                            </span>
                                        )}
                                        {activity.related_ad_id && (
                                            <span className="text-gray-300">
                                                الإعلان: <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(`/ad/${activity.related_ad_id}`)}} className="font-bold hover:underline">عرض الإعلان</a>
                                            </span>
                                        )}
                                        <span className="text-gray-400">{new Date(activity.timestamp).toLocaleString('ar-IQ')}</span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                    <span className={`font-bold text-sm ${priority.color}`}>{priority.text}</span>
                                    <p className="text-xs text-gray-500">الأولوية</p>
                                </div>
                            </div>
                        )
                    })}
                     {suspiciousActivities.length === 0 && (
                        <p className="text-center text-brand-text-secondary py-8">لا توجد أنشطة مشبوهة مسجلة حالياً. النظام نظيف!</p>
                    )}
                </div>
            </div>
        </div>
    );
};