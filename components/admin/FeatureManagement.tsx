

import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';

export const FeatureManagement: React.FC = () => {
    const { featureFlags, toggleFeatureFlag } = useAdmin();

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">إدارة الميزات الديناميكية</h2>
            <p className="text-brand-text-secondary mb-8 max-w-2xl">
                تحكم في الميزات الرئيسية للتطبيق بشكل فوري. يمكنك تفعيل أو تعطيل أي ميزة من هنا للتأثير على جميع المستخدمين. هذا مفيد لتجربة الميزات الجديدة أو إيقاف ميزة مؤقتاً للصيانة.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featureFlags.map((feature) => (
                    <div key={feature.id} className="bg-brand-secondary p-6 rounded-lg flex items-start gap-4">
                        <div className="flex-grow">
                            <h3 className="text-xl font-bold text-brand-text mb-1">{feature.name}</h3>
                            <p className="text-sm text-brand-text-secondary">{feature.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={feature.is_enabled}
                                    onChange={() => toggleFeatureFlag(feature.id)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-accent/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
                                <span className="ml-3 text-sm font-medium text-gray-300 sr-only">
                                    {feature.is_enabled ? 'مفعل' : 'معطل'}
                                </span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};