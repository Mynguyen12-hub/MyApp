import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from "firebase/auth";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { auth } from "../../config/firebaseConfig";

export interface UserInfo {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAuthLoaded: boolean;
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => Promise<void>;
  logout: () => Promise<void>;
  isOnboardingComplete: boolean;
  mounted: boolean;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [user, setUserState] = useState<UserInfo | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 🔥 Firebase Auth Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userInfo: UserInfo = {
          uid: firebaseUser.uid,
          name:
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "User",
          email: firebaseUser.email || "",
        };

        setUserState(userInfo);
        setIsLoggedIn(true);
        await AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));
        await AsyncStorage.setItem("isLoggedIn", "true");
      } else {
        setUserState(null);
        setIsLoggedIn(false);
        await AsyncStorage.removeItem("userInfo");
        await AsyncStorage.removeItem("isLoggedIn");
      }

      setIsAuthLoaded(true);
    });

    return unsubscribe;
  }, []);

  // 🔹 Load onboarding status
  useEffect(() => {
    const loadOnboarding = async () => {
      const value = await AsyncStorage.getItem("onboardingComplete");
      setIsOnboardingComplete(value === "true");
      setMounted(true);
    };

    loadOnboarding();
  }, []);

  const setUser = async (user: UserInfo | null) => {
    setUserState(user);
    if (user) {
      await AsyncStorage.setItem("userInfo", JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem("userInfo");
    }
  };
const completeOnboarding = async () => {
  await AsyncStorage.setItem("onboardingComplete", "true");
  setIsOnboardingComplete(true);
};

  const logout = async () => {
    await auth.signOut();
    setUserState(null);
    setIsLoggedIn(false);
    await AsyncStorage.removeItem("userInfo");
    await AsyncStorage.removeItem("isLoggedIn");
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAuthLoaded,
        user,
        setUser,
        logout,
        isOnboardingComplete,
        mounted,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
