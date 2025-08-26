import React, { useMemo, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Button } from '../common/Button';
import { StarIcon } from '../icons/StarIcon';
import { HandHeartIcon } from '../icons/HandHeartIcon';
import { RibbonIcon } from '../icons/RibbonIcon';
import { Input } from '../common/Input';
import { TrashIcon } from '../icons/TrashIcon';
import { Campaign } from '../../types';

const CampaignManagement: React.FC = () => {
    const { campaigns, addCampaign, updateCampaign, deleteCampaign } = useAdmin();
    const [newCampaign, setNewCampaign] = useState<Omit<Campaign, 'id' | 'current_amount' | 'donors' | 'is_active'>>({
        title: '',
        description: '',
        image_url: '',
        goal_amount: 0,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        setNewCampaign(prev => ({
            ...prev,
            [id]: type === 'number' ? Number(value) : value
        }));
    };

    const handleAddCampaign = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCampaign.title && newCampaign.description && newCampaign.image_url && newCampaign.goal_amount > 0) {
            addCampaign(newCampaign);
            setNewCampaign({ title: '', description: '', image_url: '', goal_amount: 0 });
        } else {
            alert('يرجى ملء جميع الحقول بشكل صحيح.');
        }
    };
    
    const handleDelete = (campaignId: string) => {
        window.dispatchEvent(new CustomEvent('show-confirm', {
            detail: {
                title: 'حذف الحملة',
                message: 'هل أنت متأكد من حذف هذه الحملة نهائياً؟',
                onConfirm: () => deleteCampaign(campaignId),
            }
        }));
    };

    return (
        <div className="bg-brand-secondary p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-brand-accent mb-4 flex items-center gap-2">
                <RibbonIcon /> إدارة الحملات الإنسانية
            </h3>
            
            <form onSubmit={handleAddCampaign} className="bg-brand-primary/50 p-4 rounded-lg mb-6 space-y-4">
                <h4 className="font-bold text-lg">إضافة حملة جديدة</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="title" placeholder="عنوان الحملة" value={newCampaign.title} onChange={handleInputChange} />
                    <Input id="image_url" placeholder="رابط صورة الحملة" value={newCampaign.image_url} onChange={handleInputChange} />
                </div>
                <textarea id="description" placeholder="وصف الحملة..." value={newCampaign.description} onChange={handleInputChange} rows={3} className="w-full bg-brand-secondary text-brand-text placeholder-brand-text-secondary border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-accent"></textarea>
                <div className="grid grid-cols-2 gap-4">
                    <Input id="goal_amount" type="number" placeholder="المبلغ المستهدف (د.ع)" value={String(newCampaign.goal_amount === 0 ? '' : newCampaign.goal_amount)} onChange={handleInputChange} />
                    <Button type="submit" className="w-full">إضافة الحملة</Button>
                </div>
            </form>

            <div className="max-h-96 overflow-y-auto space-y-3">
                {campaigns.map(campaign => {
                    const progress = campaign.goal_amount > 0 ? (campaign.current_amount / campaign.goal_amount) * 100 : 0;
                    return (
                        <div key={campaign.id} className="bg-brand-primary/50 p-4 rounded-lg">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-grow">
                                    <p className="font-bold text-white">{campaign.title}</p>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5 my-2">
                                        <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-brand-text-secondary">
                                        <span>{campaign.current_amount.toLocaleString()} / {campaign.goal_amount.toLocaleString()} د.ع</span>
                                        <span>{campaign.donors} متبرعين</span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-4">
                                    <label className="relative inline-flex items-center cursor-pointer" title={campaign.is_active ? 'إخفاء الحملة' : 'إظهار الحملة'}>
                                        <input
                                            type="checkbox"
                                            checked={campaign.is_active}
                                            onChange={() => updateCampaign(campaign.id, { is_active: !campaign.is_active })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                    <button onClick={() => handleDelete(campaign.id)} className="text-red-500 hover:text-red-400 p-1 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export const SocialSupportManagement: React.FC = () => {
    const { ads, users, featureAdForFree } = useAdmin();

    const smallProjectAds = useMemo(() => {
        return ads.filter(ad => {
            const user = users.find(u => u.id === ad.user_id);
            return user?.role === 'retailer' && ad.status === 'approved';
        });
    }, [ads, users]);
    
    const charitableAds = useMemo(() => {
        return ads.filter(ad => ad.is_charitable && ad.status === 'approved');
    }, [ads]);

    const unfeaturedSmallProjects = smallProjectAds.filter(ad => !ad.featured);

    const featuredThisWeekCount = useMemo(() => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return smallProjectAds.filter(ad => 
            ad.featured && ad.featured_until && new Date(ad.featured_until) > oneWeekAgo
        ).length;
    }, [smallProjectAds]);

    const handleFeature = (adId: string) => {
        if (featuredThisWeekCount >= 10) {
            alert('لقد وصلت إلى الحد الأقصى (10) من الإعلانات المميزة لهذا الأسبوع.');
            return;
        }
        
        window.dispatchEvent(new CustomEvent('show-confirm', {
            detail: {
                title: 'تمييز مجاني',
                message: 'هل أنت متأكد من تمييز هذا الإعلان مجاناً لمدة أسبوع؟',
                onConfirm: () => featureAdForFree(adId),
            }
        }));
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-brand-text flex items-center gap-3">
                <HandHeartIcon className="w-8 h-8"/>
                إدارة الدعم الاجتماعي
            </h2>

            <CampaignManagement />

            <div className="bg-brand-secondary p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-brand-accent">دعم المشاريع الصغيرة</h3>
                    <div className="bg-brand-primary/50 text-brand-accent font-bold px-4 py-2 rounded-lg">
                        {featuredThisWeekCount} / 10 إعلانات مميزة هذا الأسبوع
                    </div>
                </div>
                <p className="text-brand-text-secondary mb-4">
                    اختر الإعلانات من القائمة أدناه لتمييزها مجاناً لمدة أسبوع.
                </p>
                <div className="max-h-96 overflow-y-auto space-y-2">
                    {unfeaturedSmallProjects.length > 0 ? unfeaturedSmallProjects.map(ad => {
                        const user = users.find(u => u.id === ad.user_id);
                        return (
                            <div key={ad.id} className="bg-brand-primary/50 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={ad.images[0]} alt={ad.title} className="w-16 h-12 object-cover rounded"/>
                                    <div>
                                        <p className="font-bold text-white">{ad.title}</p>
                                        <p className="text-xs text-gray-400">بواسطة: {user?.name}</p>
                                    </div>
                                </div>
                                <Button onClick={() => handleFeature(ad.id)} className="!py-1.5 !px-3 flex items-center gap-1.5" disabled={featuredThisWeekCount >= 10}>
                                    <StarIcon className="w-4 h-4"/>
                                    تمييز لأسبوع
                                </Button>
                            </div>
                        );
                    }) : (
                        <p className="text-center text-gray-400 py-8">لا توجد إعلانات مشاريع صغيرة غير مميزة حالياً.</p>
                    )}
                </div>
            </div>
            
             <div className="bg-brand-secondary p-6 rounded-lg">
                 <h3 className="text-xl font-semibold text-brand-accent mb-4">إعلانات مبادرة دعم الفقراء ({charitableAds.length})</h3>
                 <div className="max-h-96 overflow-y-auto space-y-2">
                    {charitableAds.length > 0 ? charitableAds.map(ad => {
                         const user = users.find(u => u.id === ad.user_id);
                        return (
                             <div key={ad.id} className="bg-brand-primary/50 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={ad.images[0]} alt={ad.title} className="w-16 h-12 object-cover rounded"/>
                                    <div>
                                        <p className="font-bold text-white">{ad.title}</p>
                                        <p className="text-xs text-gray-400">بواسطة: {user?.name}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    }) : (
                         <p className="text-center text-gray-400 py-8">لا توجد إعلانات مشاركة في المبادرة الخيرية حالياً.</p>
                    )}
                 </div>
            </div>
        </div>
    );
};