import React, { useMemo } from 'react';
import { AdCard } from '../AdCard';
import { useAdmin } from '../../contexts/AdminContext';
import { useUser } from '../../contexts/UserContext';
import { EmptyState } from '../common/EmptyState';
import { BinocularsIcon } from '../icons/BinocularsIcon';

export const WatchedAdsList: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const { currentUser } = useUser();
    const { ads } = useAdmin();

    const watchedAds = useMemo(() => {
        if (!currentUser) return [];
        return ads.filter(ad => currentUser.watched_ad_ids.includes(ad.id));
    }, [currentUser, ads]);

    if (watchedAds.length === 0) {
        return (
            <div className="py-16">
                 <EmptyState
                    icon={<BinocularsIcon />}
                    title="قائمة المراقبة فارغة"
                    message="عندما تجد إعلاناً لمنافس يهمك، اضغط على زر 'المراقبة' في صفحة الإعلان لإضافته هنا وتتبع تغييرات سعره."
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {watchedAds.map(ad => (
                <div key={ad.id} className="animate-fadeInUp" style={{animationDelay: `${ad.id.slice(-1)}0ms`}}>
                    <AdCard ad={ad} onClick={() => onNavigate(`/ad/${ad.id}`)} />
                </div>
            ))}
        </div>
    );
};