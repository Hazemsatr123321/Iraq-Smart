

import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { ExternalAd } from '../../types';

export const ExternalAdManagement: React.FC = () => {
    const { externalAds, addExternalAd, updateExternalAd } = useAdmin();
    const [newAd, setNewAd] = useState({ company_name: '', image_url: '', target_url: '', is_active: true });

    const handleAddAd = (e: React.FormEvent) => {
        e.preventDefault();
        if(newAd.company_name && newAd.image_url && newAd.target_url) {
            addExternalAd(newAd);
            setNewAd({ company_name: '', image_url: '', target_url: '', is_active: true });
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">إدارة إعلانات الشركات</h2>
            
            <div className="bg-brand-secondary p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold mb-4">إضافة إعلان جديد</h3>
                <form onSubmit={handleAddAd} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <Input label="اسم الشركة" value={newAd.company_name} onChange={e => setNewAd({...newAd, company_name: e.target.value})} required />
                    <Input label="رابط الصورة" value={newAd.image_url} onChange={e => setNewAd({...newAd, image_url: e.target.value})} required />
                    <Input label="رابط الوجهة (URL)" value={newAd.target_url} onChange={e => setNewAd({...newAd, target_url: e.target.value})} required />
                    <Button type="submit" className="md:col-span-2">إضافة الإعلان</Button>
                </form>
            </div>

            <div className="space-y-4">
                {externalAds.map(ad => (
                    <div key={ad.id} className="bg-brand-secondary p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={ad.image_url} alt={ad.company_name} className="w-24 h-12 object-contain rounded bg-white"/>
                            <div>
                                <p className="font-bold text-brand-text">{ad.company_name}</p>
                                <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-accent hover:underline">{ad.target_url}</a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ad.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {ad.is_active ? 'مفعل' : 'معطل'}
                            </span>
                            <button onClick={() => updateExternalAd({...ad, is_active: !ad.is_active})} className="text-sm font-medium text-blue-400 hover:text-blue-300">
                                {ad.is_active ? 'تعطيل' : 'تفعيل'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};