
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';
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

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonatingAdminId, setImpersonatingAdminId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authEvent, setAuthEvent] = useState<any | null>(null);
  const { users, addUser, updateUser } = useAdmin();

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data: userProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
            setCurrentUser(userProfile);
        }
        setIsInitialized(true);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            const { data: userProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
            setCurrentUser(userProfile);
        } else {
            setCurrentUser(null);
        }
        setAuthEvent(event);
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw authError;
    if (!authData.user) throw new Error("Login failed, no user returned.");
    
    const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (profileError) throw profileError;
    if (!userProfile) throw new Error("User profile not found.");

    setCurrentUser(userProfile);
    return userProfile;
  };
  
  const webAuthnLogin = async (): Promise<User> => {
    throw new Error("Biometric login is not available in mock mode.");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setImpersonatingAdminId(null);
  };
  
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '#/reset-password',
    });
    if (error) throw error;
  };
  
  const changePassword = async (newPassword: string) => {
    if (!currentUser) throw new Error("No user logged in.");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const register = async (userData: RegisterData, referrerCode?: string): Promise<User> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password!,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Registration failed, no user returned.");

    const newUserPayload = {
        id: authData.user.id,
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
    };

    const { data: newUser, error: profileError } = await supabase
        .from('users')
        .insert(newUserPayload)
        .select()
        .single();

    if (profileError) throw profileError;

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