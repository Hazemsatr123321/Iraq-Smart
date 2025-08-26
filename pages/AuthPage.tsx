import React, { useState, useMemo } from 'react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { useUser } from '../contexts/UserContext';
import { User, UserRole } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { FingerprintIcon } from '../components/icons/FingerprintIcon';

const AuthFormWrapper: React.FC<{ children: React.ReactNode, onSubmit: (e: React.FormEvent) => void }> = ({ children, onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-5 animate-fadeInUp">
        {children}
    </form>
);

export const AuthPage: React.FC<{
    onLoginSuccess: (user: User) => void;
    onRegisterSuccess: (user: User) => void;
    onNavigate: (path: string) => void;
    referrerId?: string;
}> = ({ onLoginSuccess, onRegisterSuccess, onNavigate, referrerId }) => {
    const [view, setView] = useState<'login' | 'register' | 'forgot_password'>('login');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, register, resetPassword, webAuthnLogin } = useUser();
    const isBiometricSupported = typeof window !== 'undefined' && window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable;


    // Common state for email, used in login and password reset
    const [email, setEmail] = useState('');
    
    // Login state
    const [loginPassword, setLoginPassword] = useState('');

    // Register state
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [regRole, setRegRole] = useState<UserRole>('retailer');
    const [regStoreName, setRegStoreName] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const user = await login(email, loginPassword);
            if (user.banned) {
                 setError('هذا الحساب محظور. لا يمكنك تسجيل الدخول. يرجى التواصل مع إدارة التطبيق.');
                 setIsLoading(false);
                 return;
            }
            onLoginSuccess(user);
        } catch (err: any) {
            setError(err.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleWebAuthnLogin = async () => {
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const user = await webAuthnLogin();
             if (user.banned) {
                 setError('هذا الحساب محظور.');
                 setIsLoading(false);
                 return;
            }
            onLoginSuccess(user);
        } catch (err: any) {
            setError(err.message || 'فشل تسجيل الدخول بالبصمة.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (regPassword !== regConfirmPassword) {
            setError('كلمتا المرور غير متطابقتين.');
            return;
        }
        if (regPassword.length < 6) {
            setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل.');
            return;
        }

        setIsLoading(true);
        try {
            const user = await register({
                name: regName,
                email: regEmail,
                password: regPassword,
                role: regRole,
                store_name: regStoreName,
                contact: { phone: regPhone, whatsapp: regPhone },
                profile_picture: `https://i.pravatar.cc/150?u=${regEmail}`
            }, referrerId);
            onRegisterSuccess(user);
        } catch (err: any) {
             setError(err.message || 'حدث خطأ أثناء إنشاء الحساب.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            await resetPassword(email);
            setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
        } catch (err: any) {
            setError(err.message || 'حدث خطأ ما.');
        } finally {
            setIsLoading(false);
        }
    };

    const switchView = (newView: 'login' | 'register' | 'forgot_password') => {
        setError('');
        setMessage('');
        setView(newView);
    };

    return (
        <div className="min-h-screen bg-brand-primary text-brand-text flex items-center justify-center p-4 luxury-homepage-bg">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8 animate-fadeInUp">
                    <SparklesIcon className="w-16 h-16 text-brand-accent mx-auto mb-4" />
                    <h1 className="text-4xl font-extrabold text-gradient-gold">سوق العراق الذكي</h1>
                </div>

                <div className="bg-brand-secondary/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-brand-accent/20 min-h-[450px]">
                    <div className="flex justify-center border-b border-gray-700 mb-6">
                        <button
                            onClick={() => switchView('login')}
                            className={`px-6 py-3 text-lg font-bold transition-colors duration-300 border-b-2 ${view === 'login' ? 'text-brand-accent border-brand-accent' : 'text-brand-text-secondary border-transparent hover:text-white'}`}
                        >
                            تسجيل الدخول
                        </button>
                        <button
                            onClick={() => switchView('register')}
                            className={`px-6 py-3 text-lg font-bold transition-colors duration-300 border-b-2 ${view === 'register' ? 'text-brand-accent border-brand-accent' : 'text-brand-text-secondary border-transparent hover:text-white'}`}
                        >
                            إنشاء حساب
                        </button>
                    </div>

                    {view === 'login' ? (
                        <AuthFormWrapper onSubmit={handleLogin}>
                            <Input label="البريد الإلكتروني" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@example.com" required />
                            <Input label="كلمة المرور" id="password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="password123" required />
                            {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
                            <div className="flex justify-end">
                                <button type="button" onClick={() => switchView('forgot_password')} className="text-sm text-brand-accent hover:underline">نسيت كلمة المرور؟</button>
                            </div>
                            <div className="flex flex-col gap-3 !mt-8">
                                <Button type="submit" className="w-full" isLoading={isLoading}>دخول</Button>
                                {isBiometricSupported && (
                                     <Button type="button" onClick={handleWebAuthnLogin} variant="secondary" className="w-full flex items-center justify-center gap-2">
                                        <FingerprintIcon className="w-5 h-5"/>
                                        الدخول بالبصمة
                                    </Button>
                                )}
                            </div>
                        </AuthFormWrapper>
                    ) : view === 'register' ? (
                        <AuthFormWrapper onSubmit={handleRegister}>
                            <Input label="الاسم الكامل أو اسم الشركة" id="regName" type="text" value={regName} onChange={e => setRegName(e.target.value)} required />
                            <Input label="البريد الإلكتروني" id="regEmail" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="example@example.com" required />
                            <div>
                              <Input label="رقم الهاتف (للتواصل)" id="regPhone" type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="07XXXXXXXXX" required />
                              <p className="-mt-3 text-xs text-brand-text-secondary text-center">
                                  لن يتم استخدام رقم هاتفك لتسجيل الدخول.
                              </p>
                            </div>
                            <Input label="كلمة المرور" id="regPassword" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                            <Input label="تأكيد كلمة المرور" id="regConfirmPassword" type="password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} required />

                            <div>
                                <label className="block text-brand-text-secondary text-sm font-bold mb-2">نوع الحساب</label>
                                <select value={regRole} onChange={e => setRegRole(e.target.value as UserRole)} className="w-full bg-brand-primary text-brand-text border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-accent">
                                    <option value="retailer">صاحب محل (مشترٍ)</option>
                                    <option value="wholesaler">تاجر جملة (بائع)</option>
                                </select>
                            </div>
                            {regRole === 'wholesaler' && <Input label="اسم المتجر/المخزن (اختياري)" id="regStoreName" type="text" value={regStoreName} onChange={e => setRegStoreName(e.target.value)} />}
                            {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
                            <Button type="submit" className="w-full !mt-8" isLoading={isLoading}>إنشاء الحساب</Button>
                        </AuthFormWrapper>
                    ) : (
                         <AuthFormWrapper onSubmit={handlePasswordReset}>
                            <p className="text-center text-brand-text-secondary">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.</p>
                            <Input label="البريد الإلكتروني" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@example.com" required />
                            {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
                            {message && <p className="text-green-400 text-sm text-center pt-2">{message}</p>}
                            <Button type="submit" className="w-full !mt-8" isLoading={isLoading}>إرسال الرابط</Button>
                        </AuthFormWrapper>
                    )}
                </div>
                 <div className="text-center mt-6">
                    <p className="text-sm text-brand-text-secondary mb-3">أو</p>
                    <Button onClick={() => onNavigate('/')} variant="outline" className="w-full">
                        المتابعة كزائر
                    </Button>
                </div>
            </div>
        </div>
    );
};