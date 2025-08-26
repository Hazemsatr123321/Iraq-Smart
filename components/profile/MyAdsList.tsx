import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Ad, ToastType } from '../../types';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { HeartIcon } from '../icons/HeartIcon';
import { LightbulbIcon } from '../icons/LightbulbIcon';
import { ZapIcon } from '../icons/ZapIcon';
import { EmptyState } from '../common/EmptyState';
import { StarIcon } from '../icons/StarIcon';
import { Button } from '../common/Button';
import { PlusIcon } from '../icons/PlusIcon';
import { FileTextIcon } from '../icons/FileTextIcon';
import { useUser } from '../../contexts/UserContext';
import { AwardIcon } from '../icons/AwardIcon';

const getStatusBadge = (ad: Ad) => {
    switch (ad.status) {
        case 'pending': return <span className="text-xs text-yellow-400 font-bold">قيد المراجعة</span>;
        case 'approved': return <span className="text-xs text-green-400 font-bold">موافق عليه</span>;
        case 'rejected': return <span className="text-xs text-red-400 font-bold" title={`سبب الرفض: ${ad.rejection_reason}`}>مرفوض</span>;
        default: return null;
    }
}

export const MyAdsList: React.FC<{
    ads: Ad[], 
    onNavigate: (path: string) => void, 
    addToast: (message: string, type?: ToastType) => void,
    onOpenOptimizer: (ad: Ad) => void;
    onOpenFlashDeal: (ad: Ad) => void;
    onOpenFeatureModal: (ad: Ad) => void;
}> = ({ ads, onNavigate, addToast, onOpenOptimizer, onOpenFlashDeal, onOpenFeatureModal }) => {
    const { deleteAd, applyFreeFeature } = useAdmin();
    const { currentUser } = useUser();

    const handleDelete = (adId: string) => {
        window.dispatchEvent(new CustomEvent('show-confirm', {
            detail: {
                title: 'تأكيد الحذف',
                message: 'هل أنت متأكد من حذف هذا الإعلان نهائياً؟',
                onConfirm: async () => {
                    await deleteAd(adId);
                    addToast('تم حذف الإعلان بنجاح.', 'success');
                },
            }
        }));
    }
    
    const handleApplyFreeFeature = (adId: string) => {
        if (!currentUser) return;
        window.dispatchEvent(new CustomEvent('show-confirm', {
            detail: {
                title: 'استخدام مكافأة',
                message: 'هل تريد استخدام تمييز مجاني لمدة يومين لهذا الإعلان؟',
                onConfirm: async () => {
                    try {
                        await applyFreeFeature(adId, currentUser.id);
                        addToast('تهانينا! تم تمييز إعلانك مجاناً.', 'success');
                    } catch (error: any) {
                        addToast(error.message, 'error');
                    }
                },
            }
        }));
    }

    if (ads.length === 0) {
        return (
            <div className="py-16">
                <EmptyState
                    icon={<FileTextIcon />}
                    title="لا توجد إعلانات"
                    message="لم تقم بنشر أي إعلانات بعد. انقر أدناه لإضافة إعلانك الأول وجذب المشترين."
                >
                    <Button onClick={() => onNavigate('/post')} className="mt-6 flex items-center justify-center gap-2">
                        <PlusIcon />
                        أضف إعلانك الأول
                    </Button>
                </EmptyState>
            </div>
        )
    }

    return (
        <div className="space-y-3">
        {ads.map(ad => (
             <div key={ad.id} className="bg-brand-secondary p-3 rounded-lg flex items-center justify-between gap-4">
                 <div className="flex items-center gap-4 flex-grow cursor-pointer" onClick={() => onNavigate(`/ad/${ad.id}`)}>
                     <img src={ad.images[0]} alt={ad.title} className="w-20 h-16 object-cover rounded-md"/>
                     <div className="flex-grow">
                         <p className="font-bold text-brand-text">{ad.title}</p>
                         <p className="text-sm text-brand-accent">{ad.price}</p>
                         <div className="flex items-center gap-4 mt-1 text-xs text-brand-text-secondary">
                            {getStatusBadge(ad)}
                            {ad.status === 'approved' && (
                                <>
                                <span className="flex items-center gap-1"><EyeIcon className="w-4 h-4" /> {ad.views || 0}</span>
                                <span className="flex items-center gap-1"><HeartIcon className="w-4 h-4" /> {ad.saves || 0}</span>
                                {ad.featured && <span className="text-yellow-400 font-bold">(مميز)</span>}
                                </>
                            )}
                         </div>
                     </div>
                 </div>
                 <div className="flex items-center gap-1 flex-shrink-0">
                     <button onClick={() => onOpenFlashDeal(ad)} className="text-brand-text-secondary hover:text-red-500 p-2 rounded-full transition-colors" title="إنشاء صفقة برق">
                         <ZapIcon className="w-5 h-5"/>
                     </button>
                     <button onClick={() => onOpenOptimizer(ad)} className="text-brand-text-secondary hover:text-yellow-400 p-2 rounded-full transition-colors" title="تحسين ذكي">
                         <LightbulbIcon className="w-5 h-5"/>
                     </button>
                     {ad.status === 'approved' && !ad.featured && (
                        <>
                         {currentUser && currentUser.available_feature_rewards > 0 ? (
                            <button onClick={() => handleApplyFreeFeature(ad.id)} className="text-brand-text-secondary hover:text-green-400 p-2 rounded-full transition-colors" title={`استخدم التمييز المجاني (متبقي: ${currentUser.available_feature_rewards})`}>
                                <AwardIcon className="w-5 h-5"/>
                            </button>
                         ) : (
                            <button onClick={() => onOpenFeatureModal(ad)} className="text-brand-text-secondary hover:text-brand-accent p-2 rounded-full transition-colors" title="تمييز الإعلان">
                                <StarIcon className="w-5 h-5"/>
                            </button>
                         )}
                        </>
                     )}
                     <button onClick={() => onNavigate(`/post/edit/${ad.id}`)} className="text-brand-text-secondary hover:text-brand-accent p-2 rounded-full transition-colors" title="تعديل">
                         <EditIcon className="w-5 h-5"/>
                     </button>
                      <button onClick={() => handleDelete(ad.id)} className="text-brand-text-secondary hover:text-red-500 p-2 rounded-full transition-colors" title="حذف">
                         <TrashIcon className="w-5 h-5"/>
                     </button>
                 </div>
             </div>
        ))}
     </div>
    )
}
