import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { ToastType } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ResetPasswordPage: React.FC<{
    onNavigate: (path: string) => void;
    addToast: (message: string, type?: ToastType) => void;
}> = ({ onNavigate, addToast }) => {
    const { currentUser, changePassword, isInitialized } = useUser();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isInitialized && !currentUser) {
            addToast("رابط غير صالح أو منتهي الصلاحية.", "error");
            onNavigate('/auth');
        }
    }, [currentUser, isInitialized, onNavigate, addToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            addToast('كلمتا المرور غير متطابقتين.', 'error');
            return;
        }
        if (password.length < 6) {
            addToast('يجب أن تكون كلمة المرور 6 أحرف على الأقل.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(password);
            addToast('تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.', 'success');
            onNavigate('/auth');
        } catch (err: any) {
            addToast(err.message || 'فشل تحديث كلمة المرور. قد يكون الرابط منتهي الصلاحية.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isInitialized || !currentUser) {
        return (
             <div className="min-h-screen bg-brand-primary text-brand-text flex items-center justify-center p-4">
                <LoadingSpinner text="جاري التحقق من الرابط..." />
             </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-primary text-brand-text flex items-center justify-center p-4 luxury-homepage-bg">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <SparklesIcon className="w-16 h-16 text-brand-accent mx-auto mb-4" />
                    <h1 className="text-4xl font-extrabold text-gradient-gold">إعادة تعيين كلمة المرور</h1>
                </div>
                <div className="bg-brand-secondary/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-brand-accent/20">
                    <p className="text-center text-brand-text-secondary mb-6">أهلاً <span className="font-bold text-white">{currentUser.email}</span>. يرجى إدخال كلمة المرور الجديدة.</p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input label="كلمة المرور الجديدة" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <Input label="تأكيد كلمة المرور الجديدة" id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        <Button type="submit" className="w-full !mt-8" disabled={isLoading}>
                            {isLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};