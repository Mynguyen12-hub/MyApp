import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserInfo {
  name: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAuthLoaded: boolean;
  isOnboardingComplete: boolean;
  mounted: boolean;
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUserState] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Load onboarding, auth state, and user info from storage
    const loadState = async () => {
      try {
        const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        const userJson = await AsyncStorage.getItem('userInfo');
        setIsOnboardingComplete(onboardingComplete === 'true');
        setIsLoggedIn(loggedIn === 'true');
        setUserState(userJson ? JSON.parse(userJson) : null);
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsAuthLoaded(true);
        setMounted(true);
      }
    };
    loadState();
  }, []);

  const login = async () => {
    setIsLoggedIn(true);
    await AsyncStorage.setItem('isLoggedIn', 'true');
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUserState(null);
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('userInfo');
  };

  const setUser = async (user: UserInfo | null) => {
    setUserState(user);
    if (user) {
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem('userInfo');
    }
  };

  const completeOnboarding = async () => {
    setIsOnboardingComplete(true);
    await AsyncStorage.setItem('onboardingComplete', 'true');
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAuthLoaded,
        isOnboardingComplete,
        mounted,
        user,
        setUser,
        login,
        logout,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
