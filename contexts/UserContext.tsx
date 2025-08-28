
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { useAdmin } from './AdminContext';
import { supabase } from '../services/supabaseClient';

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
  featureAd: (adId: string, durationDays: number) => Promise<void>;
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
  const { users, addUser, updateUser, loadUserById } = useAdmin();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('onAuthStateChange', event, session);
        setAuthEvent(event);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            if (session?.user) {
                const userProfile = await loadUserById(session.user.id);
                setCurrentUser(userProfile as User | null);
            }
        } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
        }
        setIsInitialized(true);
    });

    // Handle initial session
    const initializeSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const userProfile = await loadUserById(session.user.id);
            setCurrentUser(userProfile as User | null);
        }
        setIsInitialized(true);
    };

    initializeSession();

    return () => {
        authListener.subscription.unsubscribe();
    };
}, [loadUserById]);

  const login = async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Login failed: No user data returned.");

    const userProfile = await loadUserById(data.user.id);
    if (!userProfile) throw new Error("Login failed: Could not find user profile.");
    
    setCurrentUser(userProfile as User);
    return userProfile as User;
  };
  
  const webAuthnLogin = async (): Promise<User> => {
    /*
    * =============================================
    * WebAuthn (Biometric Login) Implementation Guide
    * =============================================
    * This feature requires a full client-server implementation.
    *
    * Recommended Libraries:
    * - Client: @simplewebauthn/browser
    * - Server: @simplewebauthn/server (to be used in Supabase Edge Functions)
    *
    * --- Registration Flow (e.g., on a user's Account page) ---
    * 1. Client: User clicks "Register Biometrics".
    * 2. Client: Call a Supabase Edge Function `webauthn-registration-challenge`.
    * 3. Server (Edge Function):
    *    - Use `@simplewebauthn/server`'s `generateRegistrationOptions`.
    *    - Required info: `rpName`, `rpID` (relying party ID, e.g., your domain), `userID`, `userName`.
    *    - Exclude credentials the user has already registered.
    *    - Store the generated challenge in the user's session or a temporary table.
    *    - Return the options to the client.
    * 4. Client:
    *    - Use `@simplewebauthn/browser`'s `startRegistration()` with the options from the server.
    *    - This will prompt the user for their biometrics.
    * 5. Client: Send the result of `startRegistration()` to another Edge Function `webauthn-registration-verification`.
    * 6. Server (Edge Function):
    *    - Use `@simplewebauthn/server`'s `verifyRegistrationResponse()`.
    *    - If verification is successful, store the new credential details (credentialID, publicKey, counter, transports) in the `users` table (e.g., in the `webauthn_credentials` JSONB[] column).
    *
    * --- Login Flow (this function) ---
    * 1. Client: User clicks the "Login with Biometrics" button.
    * 2. Client: Call a Supabase Edge Function `webauthn-login-challenge`.
    * 3. Server (Edge Function):
    *    - Use `@simplewebauthn/server`'s `generateAuthenticationOptions()`.
    *    - Allow credentials from the user's registered credentials in the database.
    *    - Store the challenge.
    *    - Return options to the client.
    * 4. Client:
    *    - Use `@simplewebauthn/browser`'s `startAuthentication()` with the server options.
    * 5. Client: Send the result to an Edge Function `webauthn-login-verification`.
    * 6. Server (Edge Function):
    *    - Use `@simplewebauthn/server`'s `verifyAuthenticationResponse()`.
    *    - If successful, the user is authenticated. Create a new Supabase session for them.
    *    - The `onAuthStateChange` listener in this context will then pick up the new session.
    */
    throw new Error("Biometric login is not implemented yet.");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setImpersonatingAdminId(null);
  };
  
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Or a specific password reset page
    });
    if (error) throw new Error(error.message);
  };
  
  const changePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const register = async (userData: RegisterData, referrerCode?: string): Promise<User> => {
    if(!userData.password) throw new Error("Password is required for registration.");
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
            data: {
                name: userData.name,
                role: userData.role,
                profile_picture: userData.profile_picture,
                store_name: userData.store_name,
                contact: userData.contact,
                referral_code: `${userData.name.toUpperCase().slice(0,4)}${Math.floor(Math.random() * 1000)}`,
                referred_by: referrerCode || null,
            }
        }
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Registration failed: No user data returned.");

    // We assume a trigger on the auth.users table will create the public user profile.
    // We can then fetch this profile.
    const newUserProfile = await loadUserById(authData.user.id);
    if (!newUserProfile) throw new Error("Could not retrieve user profile after registration.");

    // No need to set current user here, onAuthStateChange will handle it after email confirmation.
    alert("تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق من بريدك لتفعيل حسابك.");

    return newUserProfile as User;
  };

  const toggleFavorite = async (adId: string) => {
    if (!currentUser) return;
    const isFavorited = currentUser.favorite_ad_ids.includes(adId);
    const newFavoriteIds = isFavorited
      ? currentUser.favorite_ad_ids.filter(id => id !== adId)
      : [...currentUser.favorite_ad_ids, adId];
    
    await updateUser(currentUser.id, { favorite_ad_ids: newFavoriteIds });
    setCurrentUser({ ...currentUser, favorite_ad_ids: newFavoriteIds });
  };
  
  const toggleWatchAd = async (adId: string) => {
    if (!currentUser) return;
    const isWatched = currentUser.watched_ad_ids.includes(adId);
    const newWatchedAdIds = isWatched
      ? currentUser.watched_ad_ids.filter(id => id !== adId)
      : [...currentUser.watched_ad_ids, adId];
      
    await updateUser(currentUser.id, { watched_ad_ids: newWatchedAdIds });
    setCurrentUser({ ...currentUser, watched_ad_ids: newWatchedAdIds });
  };
  
  const impersonate = (userToImpersonate: User) => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator')) {
        setImpersonatingAdminId(currentUser.id);
        setCurrentUser(userToImpersonate);
    }
  };

  const stopImpersonating = async () => {
    if (impersonatingAdminId) {
        const adminProfile = await loadUserById(impersonatingAdminId);
        setCurrentUser(adminProfile as User | null);
        setImpersonatingAdminId(null);
    }
  };

  const featureAd = async (adId: string, durationDays: number) => {
    const { error } = await supabase.rpc('feature_ad', {
      p_ad_id: adId,
      p_duration_days: durationDays,
    });

    if (error) {
      console.error('Error featuring ad:', error);
      throw new error;
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
        featureAd,
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