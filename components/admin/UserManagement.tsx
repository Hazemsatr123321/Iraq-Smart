import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import type { User, UserRole } from '../../types';
import { Input } from '../common/Input';
import { SearchIcon } from '../icons/SearchIcon';
import { ClipboardCheckIcon } from '../icons/ClipboardCheckIcon';
import { useUser } from '../../contexts/UserContext';
import { LogInIcon } from '../icons/LogInIcon';
import { Button } from '../common/Button';
import { AwardIcon } from '../icons/AwardIcon';

const roleNames: Record<UserRole, string> = {
    admin: 'مدير',
    moderator: 'مشرف',
    support: 'دعم فني',
    wholesaler: 'تاجر جملة',
    retailer: 'صاحب محل'
};

export const UserManagement: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const { users, updateUserRole, toggleUserBan, deleteUser, toggleUserVerification, grantReferralReward } = useAdmin();
    const { currentUser, impersonate } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    
    const isAdmin = currentUser?.role === 'admin';

    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.store_name && user.store_name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [users, searchQuery]);

    const handleDelete = (userId: string) => {
        window.dispatchEvent(new CustomEvent('show-confirm', {
            detail: {
                title: 'تأكيد الحذف',
                message: "تحذير: سيتم حذف هذا المستخدم وجميع إعلاناته وتقييماته بشكل نهائي. هل أنت متأكد؟",
                onConfirm: () => deleteUser(userId),
            }
        }));
    };

    const handleImpersonate = (userId: string) => {
        const userToImpersonate = users.find(u => u.id === userId);
        if (userToImpersonate) {
            window.dispatchEvent(new CustomEvent('show-confirm', {
                detail: {
                    title: 'تسجيل الدخول كـمستخدم آخر',
                    message: `هل أنت متأكد من أنك تريد تسجيل الدخول كـ ${userToImpersonate.name}؟`,
                    onConfirm: () => {
                        impersonate(userToImpersonate);
                        onNavigate('/');
                    },
                }
            }));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">إدارة المستخدمين ({filteredUsers.length})</h2>
                <div className="w-full max-w-sm">
                    <Input 
                        placeholder="ابحث عن مستخدم..."
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
                            <th scope="col" className="px-6 py-3">المستخدم</th>
                            <th scope="col" className="px-6 py-3">الدور</th>
                            <th scope="col" className="px-6 py-3">الإحالات</th>
                            <th scope="col" className="px-6 py-3">الحالة</th>
                            <th scope="col" className="px-6 py-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-brand-primary/50 hover:bg-brand-primary/30">
                                <td className="px-6 py-4 font-medium text-brand-text whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <img className="w-10 h-10 rounded-full" src={user.profile_picture} alt={user.name} />
                                        <div>
                                            <p>{user.name}</p>
                                            <p className="text-xs text-gray-400">{user.store_name || ''}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={user.role}
                                        onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-brand-accent focus:border-brand-accent block w-full p-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        disabled={user.role === 'admin' || !isAdmin}
                                    >
                                        {Object.keys(roleNames).map(role => (
                                             <option key={role} value={role}>{roleNames[role as UserRole]}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span>{user.referrals.length} إحالة</span>
                                        <span className="text-xs text-gray-400">
                                            {user.available_feature_rewards} مكافآت
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 items-start">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.banned ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {user.banned ? 'محظور' : 'نشط'}
                                        </span>
                                         <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_verified ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {user.is_verified ? 'موثق' : 'غير موثق'}
                                        </span>
                                    </div>
                                </td>
                                {isAdmin ? (
                                <td className="px-6 py-4 space-y-1 whitespace-nowrap">
                                    {user.pending_referral_reward && (
                                        <Button onClick={() => grantReferralReward(user.id)} className="!py-1 !px-2 !text-xs !w-full flex items-center justify-center gap-1">
                                            <AwardIcon className="w-4 h-4"/>
                                            منح المكافأة
                                        </Button>
                                    )}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleImpersonate(user.id)}
                                            disabled={user.role === 'admin'}
                                            className="font-medium rounded p-2 text-sm text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="تسجيل الدخول بهذا الحساب"
                                        >
                                            <LogInIcon className="w-5 h-5"/>
                                        </button>
                                        <button
                                            onClick={() => toggleUserVerification(user.id)}
                                            disabled={user.role !== 'wholesaler' && user.role !== 'admin'}
                                            className="font-medium rounded p-2 text-sm text-blue-400 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={user.is_verified ? 'إلغاء التوثيق' : 'توثيق الحساب'}
                                        >
                                            <ClipboardCheckIcon className="w-5 h-5"/>
                                        </button>
                                        <button 
                                          onClick={() => toggleUserBan(user.id)}
                                          disabled={user.role === 'admin'}
                                          className={`font-medium rounded p-2 text-sm ${user.banned ? 'text-green-400 hover:bg-green-500/10' : 'text-yellow-400 hover:bg-yellow-500/10'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                          title={user.banned ? 'رفع الحظر' : 'حظر'}
                                        >
                                            {user.banned ? 'رفع' : 'حظر'}
                                        </button>
                                         <button 
                                          onClick={() => handleDelete(user.id)}
                                          disabled={user.role === 'admin'}
                                          className="font-medium text-red-500 hover:bg-red-500/10 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                           title="حذف"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </td>
                                ) : (
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        عرض فقط
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
