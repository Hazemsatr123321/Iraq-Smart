
import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { DollarSignIcon } from '../icons/DollarSignIcon';
import { TagIcon } from '../icons/TagIcon';
import { GavelIcon } from '../icons/GavelIcon';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement<any>; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-brand-secondary p-5 rounded-xl shadow-lg flex items-center gap-5 border-l-4" style={{ borderColor: color }}>
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20`}}>
            {React.cloneElement(icon, { className: 'w-7 h-7', style: { ...(icon.props.style || {}), color } })}
        </div>
        <div>
            <p className="text-3xl font-extrabold text-brand-text">{value.toLocaleString('ar-IQ')}</p>
            <h3 className="text-md font-semibold text-brand-text-secondary">{title}</h3>
        </div>
    </div>
);

const MonthlyRevenueChart: React.FC = () => {
    const data = [
        { month: 'يناير', revenue: 150000 }, { month: 'فبراير', revenue: 220000 }, { month: 'مارس', revenue: 180000 },
        { month: 'أبريل', revenue: 280000 }, { month: 'مايو', revenue: 350000 }, { month: 'يونيو', revenue: 410000 }
    ];
    const maxRevenue = Math.max(...data.map(d => d.revenue));

    return (
        <div className="flex justify-around items-end h-80 pt-4 px-4">
            {data.map(item => (
                <div key={item.month} className="flex flex-col items-center gap-2 w-12 group">
                    <div className="text-brand-accent font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.revenue.toLocaleString()}
                    </div>
                    <div className="w-full bg-brand-primary/50 rounded-t-md" style={{ height: '100%' }}>
                        <div
                            className="w-full bg-brand-accent rounded-t-md transition-all duration-500 ease-out hover:bg-brand-accent-hover"
                            style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-brand-text-secondary">{item.month}</p>
                </div>
            ))}
        </div>
    );
};

export const FinancialsDashboard: React.FC = () => {
    const { stats, auctions } = useAdmin();
    const auctionRevenue = auctions.filter(a => a.status === 'ended').length * 1000;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-text">لوحة التحكم المالية</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                <StatCard title="إجمالي الإيرادات" value={stats.totalRevenue} icon={<DollarSignIcon />} color="#10b981" />
                <StatCard title="إيرادات تمييز الإعلانات" value={stats.featuredAdRevenue} icon={<TagIcon />} color="#3b82f6" />
                <StatCard title="إيرادات المزادات (وهمي)" value={auctionRevenue} icon={<GavelIcon />} color="#8b5cf6" />
            </div>

            <div className="bg-brand-secondary p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">نمو الإيرادات الشهرية (وهمي)</h3>
                <MonthlyRevenueChart />
            </div>
        </div>
    );
};
