import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { useUser } from '../../contexts/UserContext';
import { User, ToastType } from '../../types';
import { useAdmin } from '../../contexts/AdminContext';

interface SecretAdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  addToast: (message: string, type?: ToastType) => void;
}

export const SecretAdminLogin: React.FC<SecretAdminLoginProps> = ({ isOpen, onClose, onSuccess, addToast }) => {
  const { login } = useUser();
  const { users } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Check against the hardcoded credentials as requested
    if (username.toLowerCase() !== 'hazemsatr' || password !== 'hazemsatr1') {
      // Use a timeout to simulate network delay and prevent brute-force attacks
      setTimeout(() => {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
        setIsLoading(false);
      }, 1000);
      return;
    }

    // Supabase requires an email for login. We map the special username to the admin's email.
    const adminUser = users.find(u => u.role === 'admin');
    if (!adminUser) {
        setError('لم يتم العثور على حساب المدير في النظام.');
        setIsLoading(false);
        return;
    }

    try {
      // We use the admin's email but the user-entered password for login attempt.
      // This is a mock of a "real" password check since Supabase Auth is tied to passwords.
      const user = await login(adminUser.email, password);
      onSuccess(user);
    } catch (err: any) {
      // We show a generic error to not reveal which part was wrong
      setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[202] flex items-center justify-center p-4 animate-fadeInUp" style={{animationDuration: '0.3s'}} onClick={onClose}>
      <div className="bg-brand-primary rounded-2xl shadow-2xl w-full max-w-md p-6 border border-brand-accent" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-6">
          <ShieldCheckIcon className="w-12 h-12 text-brand-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">تسجيل دخول المدير</h2>
          <p className="text-brand-text-secondary mt-2">الرجاء إدخال بيانات الدخول الخاصة بالمدير.</p>
        </div>
        
        {isLoading ? (
          <LoadingSpinner text="جاري التحقق..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="اسم المستخدم"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="كلمة المرور"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
            <div className="mt-6 flex gap-4">
              <Button type="submit" className="w-full">دخول</Button>
              <Button onClick={onClose} variant="secondary" className="w-full">إلغاء</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};