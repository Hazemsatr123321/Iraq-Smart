import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { UsersIcon } from '../icons/UsersIcon';
import { FileTextIcon } from '../icons/FileTextIcon';
import { StarIcon } from '../icons/StarIcon';
import { TagIcon } from '../icons/TagIcon';
import { ImageIcon } from '../icons/ImageIcon';
import { SlidersIcon } from '../icons/SlidersIcon';
import { UserRole, SystemHealthStatus } from '../../types';
import { ClockIcon } from '../icons/ClockIcon';
import { DollarSignIcon } from '../icons/DollarSignIcon';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement<any>; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-brand-secondary p-5 rounded-xl shadow-lg flex items-center gap-5 border-l-4" style={{ borderColor: color }}>
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20`}}>
            {React.cloneElement(icon, { className: 'w-7 h-7', style: { ...(icon.props.style || {}), color } })}
        </div>
        <div>
            <p className="text-3xl font-extrabold text-brand-text">{value}</p>
            <h3 className="text-md font-semibold text-brand-text-secondary">{title}</h3>
        </div>
    </div>
);

const ActivityItem: React.FC<{ icon: React.ReactNode; text: React.ReactNode; time: string }> = ({ icon, text, time }) => (
    <div className="flex gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-grow">
            <p className="text-brand-text text-sm">{text}</p>
            <p className="text-xs text-brand-text-secondary">{time}</p>
        </div>
    </div>
);

const HealthStatusIndicator: React.FC<{ status: SystemHealthStatus }> = ({ status }) => {
    const config = {
        operational: { text: 'يعمل', color: 'bg-green-500' },
        degraded: { text: 'بطء', color: 'bg-yellow-500' },
        outage: { text: 'متوقف', color: 'bg-red-500' },
    };
    const { text, color } = config[status];
    return (
        <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${color}`}></span>
            <span>{text}</span>
        </div>
    );
};

const roleNames: Record<UserRole, string> = {
    admin: 'مدير',
    moderator: 'مشرف',
    support: 'دعم فني',
    wholesaler: 'تاجر جملة',
    retailer: 'صاحب محل'
};

export const Dashboard: React.FC = () => {
    const { stats, ads, reviews, users, systemHealth } = useAdmin();
    
    const recentActivity = [
        ...ads.slice(0, 3).map(ad => ({ type: 'ad', data: ad, date: new Date() })),
        ...reviews.slice(0, 2).map(review => ({ type: 'review', data: review, date: new Date(review.timestamp) }))
    ].sort((a,b) => b.date.getTime() - a.date.getTime());

    const adminTeam = users.filter(u => ['admin', 'moderator', 'support'].includes(u.role));


    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-text">لوحة المعلومات</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-5 mb-8">
                <StatCard title="إجمالي المستخدمين" value={stats.userCount} icon={<UsersIcon />} color="#3b82f6" />
                <StatCard title="إجمالي الإعلانات" value={stats.adCount} icon={<FileTextIcon />} color="#10b981" />
                 <StatCard title="إعلانات قيد المراجعة" value={stats.pendingAdCount} icon={<ClockIcon />} color="#f59e0b" />
                <StatCard title="إجمالي التقييمات" value={stats.reviewCount} icon={<StarIcon />} color="#f59e0b" />
                <StatCard title="إعلانات خارجية نشطة" value={stats.activeExternalAdsCount} icon={<ImageIcon />} color="#8b5cf6" />
                <StatCard title="أرباح التمييز" value={`${stats.featuredAdRevenue.toLocaleString('ar-IQ')} د.ع`} icon={<TagIcon />} color="#ef4444" />
                <StatCard title="الميزات المفعلة" value={stats.activeFeatureCount} icon={<SlidersIcon />} color="#6366f1" />
                 <StatCard title="إجمالي الأرباح" value={`${stats.totalRevenue.toLocaleString('ar-IQ')} د.ع`} icon={<DollarSignIcon />} color="#10b981" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* System Health */}
                <div className="lg:col-span-1 bg-brand-secondary p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">حالة النظام</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center"><span className="font-semibold">واجهة برمجة التطبيقات (API)</span> <HealthStatusIndicator status={systemHealth.api_status} /></div>
                        <div className="flex justify-between items-center"><span className="font-semibold">قاعدة البيانات</span> <HealthStatusIndicator status={systemHealth.database_status} /></div>
                        <div className="flex justify-between items-center"><span className="font-semibold">خدمة الذكاء الاصطناعي</span> <HealthStatusIndicator status={systemHealth.ai_service_status} /></div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-brand-secondary p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">آخر الأنشطة</h3>
                    <div className="space-y-5">
                       {recentActivity.map((activity, index) => {
                           if (activity.type === 'ad') {
                               const adUser = users.find(u => u.id === (activity.data as any).user_id);
                               return <ActivityItem key={index} icon={<FileTextIcon className="w-5 h-5 text-green-400" />} text={<>إعلان جديد: <b>{(activity.data as any).title}</b> بواسطة {adUser?.name}</>} time="قبل لحظات" />
                           }
                           if (activity.type === 'review') {
                               const reviewUser = users.find(u => u.id === (activity.data as any).reviewer_id);
                               return <ActivityItem key={index} icon={<StarIcon className="w-5 h-5 text-yellow-400"/>} text={<>تقييم جديد <b>({(activity.data as any).rating} نجوم)</b> من {reviewUser?.name}</>} time={new Date((activity.data as any).timestamp).toLocaleDateString('ar-IQ')} />
                           }
                           return null;
                       })}
                    </div>
                </div>
                 {/* Admin Team */}
                <div className="lg:col-span-3 bg-brand-secondary p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">فريق الإدارة</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {adminTeam.map(user => (
                            <div key={user.id} className="bg-brand-primary/50 p-3 rounded-lg flex items-center gap-3">
                                <img src={user.profile_picture} alt={user.name} className="w-12 h-12 rounded-full"/>
                                <div>
                                    <p className="font-bold text-brand-text">{user.name}</p>
                                    <p className="text-sm text-brand-accent">{roleNames[user.role]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};