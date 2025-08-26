
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { useAdmin } from './AdminContext';

interface RegisterData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  profile_picture: string;
  store_name?: string;
  contact: {
    phone: string;
    whatsapp: string;
  };
}

interface UserContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  webAuthnLogin: () => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: RegisterData, referrerCode?: string) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  favorite_ad_ids: string[];
  toggleFavorite: (adId: string) => Promise<void>;
  toggleWatchAd: (adId: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  isInitialized: boolean;
  impersonatingAdminId: string | null;
  impersonate: (userToImpersonate: User) => void;
  stopImpersonating: () => Promise<void>;
  authEvent: any | null;
  setAuthEvent: (event: any | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Hardcoded passwords for mock users for demonstration
const MOCK_PASSWORDS: Record<string, string> = {
    'admin@example.com': 'hazemsatr1',
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonatingAdminId, setImpersonatingAdminId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(true);
  const [authEvent, setAuthEvent] = useState<any | null>(null);
  const { users, addUser, updateUser } = useAdmin();

  const login = async (email: string, password: string): Promise<User> => {
    console.log(`Attempting login for ${email}`);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Simulate password check
    if (user && MOCK_PASSWORDS[user.email] === password) {
        console.log("Login successful", user);
        setCurrentUser(user);
        return user;
    } else {
        console.log("Login failed");
        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    }
  };
  
  const webAuthnLogin = async (): Promise<User> => {
    throw new Error("Biometric login is not available in mock mode.");
  };

  const logout = async () => {
    setCurrentUser(null);
    setImpersonatingAdminId(null);
  };
  
  const resetPassword = async (email: string) => {
    console.log(`Password reset requested for ${email}. In a real app, an email would be sent.`);
    // In mock mode, we just show a success message.
    return Promise.resolve();
  };
  
  const changePassword = async (newPassword: string) => {
    if (!currentUser) throw new Error("No user logged in.");
    console.log(`Password for ${currentUser.email} changed to ${newPassword}.`);
    MOCK_PASSWORDS[currentUser.email] = newPassword; // Update mock password
    return Promise.resolve();
  };

  const register = async (userData: RegisterData, referrerCode?: string): Promise<User> => {
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error("هذا البريد الإلكتروني مسجل بالفعل.");
    }

    const newUserPayload: Omit<User, 'id'> = {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        profile_picture: userData.profile_picture,
        store_name: userData.store_name,
        contact: userData.contact,
        favorite_ad_ids: [],
        watched_ad_ids: [],
        reputation: 'New Seller',
        is_verified: false,
        referral_code: `${userData.name.toUpperCase().slice(0,4)}${Math.floor(Math.random() * 1000)}`,
        referrals: [],
        available_feature_rewards: 0,
    }

    const newUser = await addUser(newUserPayload);
    // @ts-ignore
    MOCK_PASSWORDS[newUser.email] = userData.password; // Add password for new user
    setCurrentUser(newUser);
    return newUser;
  };

  const toggleFavorite = async (adId: string) => {
    if (!currentUser) return;
    const isFavorited = currentUser.favorite_ad_ids.includes(adId);
    const newFavoriteIds = isFavorited
      ? currentUser.favorite_ad_ids.filter(id => id !== adId)
      : [...currentUser.favorite_ad_ids, adId];
    
    const updatedUser = { ...currentUser, favorite_ad_ids: newFavoriteIds };
    await updateUser(currentUser.id, { favorite_ad_ids: newFavoriteIds });
    setCurrentUser(updatedUser);
  };
  
  const toggleWatchAd = async (adId: string) => {
    if (!currentUser) return;
    const isWatched = currentUser.watched_ad_ids.includes(adId);
    const newWatchedAdIds = isWatched
      ? currentUser.watched_ad_ids.filter(id => id !== adId)
      : [...currentUser.watched_ad_ids, adId];
      
    const updatedUser = { ...currentUser, watched_ad_ids: newWatchedAdIds };
    await updateUser(currentUser.id, { watched_ad_ids: newWatchedAdIds });
    setCurrentUser(updatedUser);
  };
  
  const impersonate = (userToImpersonate: User) => {
    if (currentUser) {
        setImpersonatingAdminId(currentUser.id);
        setCurrentUser(userToImpersonate);
    }
  };

  const stopImpersonating = async () => {
    if (impersonatingAdminId) {
        const adminProfile = users.find(u => u.id === impersonatingAdminId);
        setCurrentUser(adminProfile || null);
        setImpersonatingAdminId(null);
    }
  };
  
  return (
    <UserContext.Provider value={{ 
        currentUser, 
        login, 
        webAuthnLogin,
        logout, 
        register, 
        resetPassword,
        favorite_ad_ids: currentUser?.favorite_ad_ids || [], 
        toggleFavorite,
        toggleWatchAd,
        changePassword,
        isInitialized,
        impersonatingAdminId,
        impersonate,
        stopImpersonating,
        authEvent,
        setAuthEvent,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};