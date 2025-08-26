
import React from 'react';
import { WrenchIcon } from '../components/icons/WrenchIcon';

export const MaintenancePage: React.FC = () => {
    return (
        <div className="bg-brand-primary min-h-screen text-brand-text flex items-center justify-center p-4">
            <div className="text-center bg-brand-secondary p-10 rounded-2xl shadow-2xl shadow-black/30 border border-brand-accent/20 max-w-lg">
                <WrenchIcon className="w-20 h-20 text-brand-accent mx-auto mb-6 animate-bounce" />
                <h1 className="text-4xl font-extrabold text-gradient-gold mb-4">التطبيق قيد الصيانة</h1>
                <p className="text-lg text-brand-text-secondary leading-relaxed">
                    نحن نعمل حالياً على إجراء بعض التحسينات والتحديثات لنقدم لكم تجربة أفضل.
                    <br />
                    شكراً لتفهمكم، سنعود قريباً!
                </p>
            </div>
        </div>
    );
};