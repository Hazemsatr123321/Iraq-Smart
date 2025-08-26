import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Input } from '../common/Input';
import { SearchIcon } from '../icons/SearchIcon';
import type { Ad } from '../../types';
import { ZapIcon } from '../icons/ZapIcon';

const AdStatusBadge: React.FC<{ status: Ad['status'] }> = ({ status }) => {
    switch (status) {
        case 'pending':
            return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">قيد المراجعة</span>;
        case 'approved':
            return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">موافق عليه</span>;
        case 'rejected':
            return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">مرفوض</span>;
        default:
            return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300">غير معروف</span>;
    }
}

export const AdManagement: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const { ads, users, toggleAdFeature, deleteAd, updateAdStatus, updateAd, endFlashDeal } = useAdmin();
    const [searchQuery, setSearchQuery] = useState('');

    const sortedAds = useMemo(() => {
        return [...ads]
            .filter(ad => ad.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                if (a.status === 'pending') return -1;
                if (b.status === 'pending') return 1;
                return new Date(b.flash_deal?.end_time || 0).getTime() - new Date(a.flash_deal?.end_time || 0).getTime();
            });
    }, [ads, searchQuery]);
    
    const handleApprove = (adId: string) => {
        updateAdStatus(adId, 'approved');
    };

    const handleReject = (adId: string) => {
        window.dispatchEvent(new CustomEvent('show-prompt', {
            detail: {
                title: 'سبب الرفض',
                message: 'الرجاء إدخال سبب الرفض (سيظهر للمستخدم):',
                onConfirm: (reason: string) => {
                    if (reason) {
                        updateAdStatus(adId, 'rejected', reason);
                    }
                }
            }
        }));
    };
    
    const handleDelete = (adId: string) => {
        window.dispatchEvent(new CustomEvent('show-confirm', {
            detail: {
                title: 'تأكيد الحذف',
                message: 'هل أنت متأكد من حذف هذا الإعلان؟',
                onConfirm: () => deleteAd(adId),
            }
        }));
    }


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold">إدارة الإعلانات ({sortedAds.length})</h2>
                 <div className="w-full max-w-sm">
                    <Input 
                        placeholder="ابحث عن إعلان..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        icon={<SearchIcon className="w-5 h-5 text-brand-text-secondary"/>}
                    />
                </div>
            </div>
            <div className="bg-brand-secondary rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-brand-text-secondary">
                    <thead className="text-xs text-brand-text uppercase bg-brand-primary/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">الإعلان</th>
                            <th scope="col" className="px-6 py-3">الناشر</th>
                            <th scope="col" className="px-6 py-3">الحالة</th>
                            <th scope="col" className="px-6 py-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAds.map(ad => {
                            const user = users.find(u => u.id === ad.user_id);
                            const isFlashDealActive = ad.flash_deal?.is_active && new Date(ad.flash_deal.end_time) > new Date();
                            return (
                                <tr key={ad.id} className={`border-b border-brand-primary/50 hover:bg-brand-primary/30 ${ad.status === 'pending' ? 'bg-yellow-900/20' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-brand-text whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <img className="w-16 h-10 rounded object-cover" src={ad.images[0]} alt={ad.title} />
                                            <p>{ad.title}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user?.name || 'مستخدم محذوف'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <AdStatusBadge status={ad.status} />
                                            {isFlashDealActive && <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400"><ZapIcon className="w-3 h-3"/> صفقة برق</span>}
                                            {ad.ai_quality_verification_status === 'pending' && <span className="text-xs text-blue-400">(ينتظر ختم الجودة)</span>}
                                            {ad.ai_quality_verification_status === 'verified' && <span className="text-xs text-blue-300">(✓ تم التحقق بالجودة)</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 space-y-2 whitespace-nowrap">
                                        {ad.status === 'pending' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleApprove(ad.id)} className="font-medium rounded px-3 py-1 text-sm text-green-400 hover:bg-green-500/10">موافقة</button>
                                                <button onClick={() => handleReject(ad.id)} className="font-medium rounded px-3 py-1 text-sm text-red-400 hover:bg-red-500/10">رفض</button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => toggleAdFeature(ad.id)}
                                                    className={`font-medium rounded px-3 py-1 text-sm ${ad.featured ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-blue-400 hover:bg-blue-500/10'}`}
                                                >
                                                    {ad.featured ? 'إزالة التمييز' : 'تمييز'}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(ad.id)}
                                                    className="font-medium text-red-400 hover:bg-red-500/10 px-3 py-1 rounded text-sm"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        )}
                                        {isFlashDealActive && (
                                            <button onClick={() => endFlashDeal(ad.id)} className="font-medium rounded px-3 py-1 text-sm text-red-400 hover:bg-red-500/10 w-full text-center">إنهاء الصفقة</button>
                                        )}
                                        {ad.ai_quality_verification_status === 'pending' && ad.status === 'approved' && (
                                            <div className="flex items-center gap-1 pt-2 border-t border-gray-700/50">
                                                <span className="text-xs text-yellow-400 font-bold">ختم الجودة؟</span>
                                                <button onClick={() => updateAd(ad.id, { ai_quality_verification_status: 'verified' })} className="font-medium rounded px-2 py-1 text-xs text-green-400 hover:bg-green-500/10">موافقة</button>
                                                <button onClick={() => updateAd(ad.id, { ai_quality_verification_status: 'rejected' })} className="font-medium rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10">رفض</button>
                                            </div>
                                        )}
                                        <button 
                                          onClick={() => onNavigate(`/ad/${ad.id}`)}
                                          className="font-medium text-gray-400 hover:text-white"
                                        >
                                           عرض
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {sortedAds.length === 0 && <p className="text-center p-8">لا توجد إعلانات تطابق بحثك.</p>}
            </div>
        </div>
    );
};
