import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ToastType, User } from '../../types';
import { BellRingIcon } from '../icons/BellRingIcon';
import { FingerprintIcon } from '../icons/FingerprintIcon';
import { MoonIcon } from '../icons/MoonIcon';
import { SunIcon } from '../icons/SunIcon';
import { LaptopIcon } from '../icons/LaptopIcon';
import { useTheme } from '../../contexts/ThemeContext';

// This function is needed to convert the VAPID public key to a Uint8Array
const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

const bufferToBase64URL = (buffer: ArrayBuffer): string => {
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer))))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};


export const AccountSettings: React.FC<{
    user: User,
    addToast: (message: string, type?: ToastType) => void
}> = ({ user, addToast }) => {
    const { updateUser } = useAdmin();
    const { changePassword } = useUser();
    const { theme, setTheme } = useTheme();

    const [formData, setFormData] = useState({
        name: user.name,
        storeName: user.store_name || '',
        phone: user.contact.phone,
        profilePicture: user.profile_picture
    });
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isBiometricLoading, setIsBiometricLoading] = useState(false);
    const isBiometricSupported = typeof window !== 'undefined' && window.PublicKeyCredential;


    useEffect(() => {
        // Check if there is an active service worker and a push subscription
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(subscription => {
                    if (subscription) {
                        setIsSubscribed(true);
                    }
                });
            });
        }
    }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPasswordData(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            updateUser(user.id, {
                name: formData.name,
                store_name: formData.storeName,
                contact: { ...user.contact, phone: formData.phone },
                profile_picture: formData.profilePicture,
            });
            addToast("تم حفظ تغييرات الحساب بنجاح!", 'success');
        } catch(error: any) {
            addToast(error.message || 'حدث خطأ ما.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addToast('كلمتا المرور غير متطابقتين!', 'error');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            addToast('يجب أن تكون كلمة المرور 6 أحرف على الأقل.', 'error');
            return;
        }
        setIsUpdatingPassword(true);
        try {
            await changePassword(passwordData.newPassword);
            addToast('تم تغيير كلمة المرور بنجاح!', 'success');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            addToast(error.message || 'حدث خطأ أثناء تغيير كلمة المرور.', 'error');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

     const handleNotificationSubscribe = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            addToast('متصفحك لا يدعم الإشعارات الفورية.', 'error');
            return;
        }

        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission === 'granted') {
            try {
                const registration = await navigator.serviceWorker.ready;
                let subscription = await registration.pushManager.getSubscription();
                if (!subscription) {
                    const vapidPublicKey = 'BEl31w5_ys35wiamIqG23M2_1s82bu2-i2SKs2ag6U0Ym9Kj0i_0Nf9xMpbqDqGzb4F5u6yNBUMC05TAmJcBGJ4';
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                    });
                }
                console.log('Push Subscription:', JSON.stringify(subscription));
                setIsSubscribed(true);
                addToast('تم تفعيل الإشعارات بنجاح!', 'success');
            } catch (error) {
                console.error('Failed to subscribe to push notifications:', error);
                addToast('فشل تفعيل الإشعارات.', 'error');
            }
        } else {
            addToast('تم رفض إذن الإشعارات.', 'error');
        }
    };

    const sendTestNotification = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            if (registration && registration.active) {
                registration.showNotification('إشعار تجريبي 🔔', {
                    body: 'هذا إشعار تجريبي من سوق العراق الذكي!',
                    icon: '/icons/icon-192x192.png',
                    data: { url: window.location.origin + window.location.pathname + '#/notifications' }
                });
                addToast('تم إرسال إشعار تجريبي.', 'success');
            } else {
                 addToast('Service worker غير جاهز.', 'error');
            }
        } catch (error) {
            console.error('Error sending test notification:', error);
            addToast('فشل إرسال الإشعار.', 'error');
        }
    };
    
    const handleRegisterBiometrics = async () => {
        if (!isBiometricSupported) {
            addToast("جهازك أو متصفحك لا يدعم تسجيل الدخول بالبصمة.", "error");
            return;
        }

        setIsBiometricLoading(true);
        try {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { name: "سوق العراق الذكي", id: window.location.hostname },
                    user: {
                        id: new TextEncoder().encode(user.id),
                        name: user.email,
                        displayName: user.name,
                    },
                    pubKeyCredParams: [{ type: 'public-key', alg: -7 }], // ES256
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required',
                    },
                    timeout: 60000,
                }
            });

            if (credential) {
                const credentialId = bufferToBase64URL((credential as any).rawId);
                updateUser(user.id, { web_authn_credential_id: credentialId });
                addToast("تم تفعيل الدخول بالبصمة بنجاح!", "success");
            }

        } catch (err) {
            console.error("Biometric registration failed:", err);
            addToast("فشل تفعيل الدخول بالبصمة. قد تكون ألغيت العملية.", "error");
        } finally {
            setIsBiometricLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-10">
            {/* Theme Settings */}
            <div className="bg-brand-secondary p-6 rounded-lg space-y-4">
                 <h3 className="text-xl font-bold">المظهر</h3>
                 <div className="flex items-center justify-around bg-brand-primary p-2 rounded-lg">
                    <button onClick={() => setTheme('light')} className={`flex flex-col items-center gap-1 p-2 rounded w-20 ${theme === 'light' ? 'bg-brand-accent text-brand-primary' : 'hover:bg-brand-secondary/50'}`}>
                        <SunIcon className="w-6 h-6"/>
                        <span className="text-xs font-semibold">فاتح</span>
                    </button>
                    <button onClick={() => setTheme('dark')} className={`flex flex-col items-center gap-1 p-2 rounded w-20 ${theme === 'dark' ? 'bg-brand-accent text-brand-primary' : 'hover:bg-brand-secondary/50'}`}>
                        <MoonIcon className="w-6 h-6"/>
                        <span className="text-xs font-semibold">داكن</span>
                    </button>
                    <button onClick={() => setTheme('system')} className={`flex flex-col items-center gap-1 p-2 rounded w-20 ${theme === 'system' ? 'bg-brand-accent text-brand-primary' : 'hover:bg-brand-secondary/50'}`}>
                        <LaptopIcon className="w-6 h-6"/>
                        <span className="text-xs font-semibold">النظام</span>
                    </button>
                 </div>
            </div>

            <div className="bg-brand-secondary p-6 rounded-lg space-y-6">
                <h3 className="text-xl font-bold">تعديل معلومات الحساب</h3>
                <Input label="البريد الإلكتروني (للدخول)" id="email" value={user.email} disabled className="!bg-brand-primary/50 !text-gray-400" />
                <Input label="الاسم الكامل أو اسم الشركة" id="name" value={formData.name} onChange={handleInputChange} />
                {user.role === 'wholesaler' && <Input label="اسم المتجر/المخزن" id="storeName" value={formData.storeName} onChange={handleInputChange} />}
                <Input label="رقم الهاتف (للتواصل)" id="phone" value={formData.phone} onChange={handleInputChange} />
                <Input label="رابط الصورة الشخصية" id="profilePicture" value={formData.profilePicture} onChange={handleInputChange} />
                <Button onClick={handleSaveChanges} className="w-full" disabled={isSaving}>
                    {isSaving ? 'جاري الحفظ...' : 'حفظ تغييرات الحساب'}
                </Button>
            </div>

             {/* Notification Settings */}
            <div className="bg-brand-secondary p-6 rounded-lg space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><BellRingIcon className="w-6 h-6"/> الإشعارات الفورية</h3>
                <p className="text-sm text-brand-text-secondary">
                    احصل على تنبيهات فورية للرسائل الجديدة، العروض، وتحديثات السوق الهامة، حتى عندما يكون التطبيق مغلقاً.
                </p>
                {notificationPermission === 'granted' && isSubscribed ? (
                    <div className="text-center space-y-3">
                         <p className="text-green-400 font-bold">الإشعارات مفعلة على هذا الجهاز.</p>
                         <Button onClick={sendTestNotification} variant="secondary">إرسال إشعار تجريبي</Button>
                    </div>
                ) : notificationPermission === 'denied' ? (
                     <p className="text-red-400 font-bold text-center">تم حظر الإشعارات. يرجى تفعيلها من إعدادات المتصفح.</p>
                ) : (
                    <Button onClick={handleNotificationSubscribe} className="w-full">تفعيل الإشعارات</Button>
                )}
            </div>
            
            {/* Biometric Settings */}
            <div className="bg-brand-secondary p-6 rounded-lg space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><FingerprintIcon className="w-6 h-6"/> الأمان وتسجيل الدخول</h3>
                <p className="text-sm text-brand-text-secondary">
                    استخدم بصمة الإصبع أو معرف الوجه لتسجيل دخول آمن وسريع بدون كلمة مرور.
                </p>
                {isBiometricSupported ? (
                    user.web_authn_credential_id ? (
                        <div className="text-center space-y-3">
                            <p className="text-green-400 font-bold">الدخول بالبصمة مفعل على هذا الجهاز.</p>
                            <Button onClick={handleRegisterBiometrics} variant="secondary" disabled={isBiometricLoading}>
                                {isBiometricLoading ? 'جاري...' : 'إعادة تسجيل البصمة'}
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={handleRegisterBiometrics} className="w-full" disabled={isBiometricLoading}>
                            {isBiometricLoading ? 'يرجى لمس المستشعر...' : 'تفعيل الدخول بالبصمة'}
                        </Button>
                    )
                ) : (
                    <p className="text-yellow-400 font-bold text-center">متصفحك لا يدعم هذه الميزة.</p>
                )}
            </div>

            <div className="bg-brand-secondary p-6 rounded-lg space-y-6">
                 <h3 className="text-xl font-bold">تغيير كلمة المرور</h3>
                 <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <Input label="كلمة المرور الجديدة" id="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} />
                    <Input label="تأكيد كلمة المرور الجديدة" id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} />
                    <Button type="submit" className="w-full" disabled={isUpdatingPassword}>
                         {isUpdatingPassword ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                    </Button>
                 </form>
            </div>
        </div>
    );
};