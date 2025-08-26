import React from 'react';
import { Button } from '../components/common/Button';
import { SearchIcon } from '../components/icons/SearchIcon';

export const NotFoundPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    return (
        <div className="bg-brand-primary min-h-screen text-brand-text flex items-center justify-center p-4">
            <div className="text-center bg-brand-secondary p-10 rounded-2xl shadow-2xl shadow-black/30 border border-brand-accent/20 max-w-lg">
                <SearchIcon className="w-20 h-20 text-brand-accent mx-auto mb-6" />
                <h1 className="text-4xl font-extrabold text-gradient-gold mb-4">خطأ 404 - الصفحة غير موجودة</h1>
                <p className="text-lg text-brand-text-secondary leading-relaxed">
                    عفواً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم حذفها أو أن الرابط الذي اتبعته غير صحيح.
                </p>
                <Button onClick={() => onNavigate('/')} className="mt-8">
                    العودة إلى الواجهة الرئيسية
                </Button>
            </div>
        </div>
    );
};