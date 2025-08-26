import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { AppSettings as AppSettingsType, AnnouncementType } from '../../types';

export const AppSettings: React.FC = () => {
    const { settings, updateSettings } = useAdmin();
    const [localSettings, setLocalSettings] = useState<AppSettingsType>(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSave = () => {
        const saveAction = () => {
            updateSettings(localSettings);
            alert("تم حفظ الإعدادات!");
        };

        if (localSettings.maintenance_mode && !settings.maintenance_mode) {
            window.dispatchEvent(new CustomEvent('show-confirm', {
                detail: {
                    title: 'تفعيل وضع الصيانة',
                    message: "هل أنت متأكد من تفعيل وضع الصيانة؟ سيتم قفل التطبيق لجميع المستخدمين ما عدا المدراء.",
                    onConfirm: saveAction,
                }
            }));
        } else {
            saveAction();
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        // @ts-ignore
        const checked = e.target.checked;
        setLocalSettings(prev => ({ ...prev, [id]: isCheckbox ? checked : value }));
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">إعدادات التطبيق</h2>
            <div className="bg-brand-secondary p-6 rounded-lg max-w-2xl mx-auto space-y-8">
                
                 {/* App Status */}
                 <div className="space-y-4 border-2 border-red-500/30 p-4 rounded-lg">
                     <h3 className="text-xl font-semibold text-red-400 border-b border-red-500/30 pb-2">حالة التطبيق</h3>
                     <div className="flex items-center justify-between">
                        <label htmlFor="maintenance_mode" className="text-lg text-brand-text">تفعيل وضع الصيانة</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            id="maintenance_mode"
                            checked={localSettings.maintenance_mode}
                            onChange={handleInputChange}
                            className="sr-only peer" 
                           />
                          <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>
                    <p className="text-xs text-gray-400">عند تفعيل هذا الخيار، سيتم قفل التطبيق لجميع المستخدمين (ما عدا المدراء) وستظهر لهم شاشة الصيانة.</p>
                </div>

                {/* General Settings */}
                <div className="space-y-4">
                     <h3 className="text-xl font-semibold text-brand-accent border-b border-brand-accent/30 pb-2">الإعدادات العامة</h3>
                     <div className="flex items-center justify-between">
                        <label htmlFor="google_ads_enabled" className="text-lg text-brand-text">تفعيل إعلانات Google AdMob</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            id="google_ads_enabled"
                            checked={localSettings.google_ads_enabled}
                            onChange={handleInputChange}
                            className="sr-only peer" 
                           />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-accent/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
                        </label>
                    </div>
                    <div>
                       <Input 
                            label="سعر تمييز الإعلان (بالدينار العراقي)"
                            type="number"
                            id="featured_ad_price"
                            value={localSettings.featured_ad_price}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                 {/* Payment Settings */}
                <div className="space-y-4">
                     <h3 className="text-xl font-semibold text-brand-accent border-b border-brand-accent/30 pb-2">إعدادات الدفع</h3>
                     <Input 
                        label="رقم محفظة زين كاش"
                        type="text"
                        id="zain_cash_number"
                        value={localSettings.zain_cash_number || ''}
                        onChange={handleInputChange}
                    />
                    <Input 
                        label="رقم محفظة آسيا باي"
                        type="text"
                        id="asia_pay_number"
                        value={localSettings.asia_pay_number || ''}
                        onChange={handleInputChange}
                    />
                </div>
                
                 {/* Social Support Descriptions */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-brand-accent border-b border-brand-accent/30 pb-2">إدارة نصوص الدعم الاجتماعي</h3>
                    <div>
                        <label htmlFor="charity_program_description" className="block text-brand-text-secondary text-sm font-bold mb-2">النص التعريفي لبرنامج دعم الفقراء</label>
                        <textarea 
                            id="charity_program_description" 
                            rows={3} 
                            value={localSettings.charity_program_description}
                            onChange={handleInputChange}
                            className="w-full bg-brand-primary text-brand-text placeholder-brand-text-secondary border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        />
                    </div>
                     <div>
                        <label htmlFor="small_projects_program_description" className="block text-brand-text-secondary text-sm font-bold mb-2">النص التعريفي لبرنامج دعم المشاريع الصغيرة</label>
                        <textarea 
                            id="small_projects_program_description" 
                            rows={3} 
                            value={localSettings.small_projects_program_description}
                            onChange={handleInputChange}
                            className="w-full bg-brand-primary text-brand-text placeholder-brand-text-secondary border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        />
                    </div>
                </div>

                {/* Announcement Banner Settings */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-brand-accent border-b border-brand-accent/30 pb-2">إدارة الإعلان العام</h3>
                     <div className="flex items-center justify-between">
                        <label htmlFor="is_announcement_active" className="text-lg text-brand-text">تفعيل شريط الإعلان العام</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            id="is_announcement_active"
                            checked={localSettings.is_announcement_active}
                            onChange={handleInputChange}
                            className="sr-only peer" 
                           />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-accent/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
                        </label>
                    </div>
                    <div>
                        <label htmlFor="announcement_text" className="block text-brand-text-secondary text-sm font-bold mb-2">نص الرسالة</label>
                        <textarea 
                            id="announcement_text" 
                            rows={3} 
                            value={localSettings.announcement_text}
                            onChange={handleInputChange}
                            className="w-full bg-brand-primary text-brand-text placeholder-brand-text-secondary border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        />
                    </div>
                     <div>
                        <label htmlFor="announcement_type" className="block text-brand-text-secondary text-sm font-bold mb-2">نوع الرسالة</label>
                        <select 
                            id="announcement_type"
                            value={localSettings.announcement_type}
                            onChange={handleInputChange}
                            className="w-full bg-brand-primary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        >
                            <option value="info">معلومة (أزرق)</option>
                            <option value="warning">تحذير (أحمر)</option>
                            <option value="offer">عرض (أخضر)</option>
                        </select>
                     </div>
                </div>
                
                <Button onClick={handleSave} className="w-full !mt-10">حفظ كل التغييرات</Button>
            </div>
        </div>
    );
};
