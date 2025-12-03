// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Slot, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import OnboardingScreen from './(onboarding)/OnboardingScreen';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

// component chịu trách nhiệm redirect theo trạng thái login
function AuthGate() {
  const { isLoggedIn, isAuthLoaded, isOnboardingComplete, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!mounted || !isAuthLoaded) return;

    if (!isOnboardingComplete) {
      // Show onboarding first time
      router.replace('/(onboarding)/OnboardingScreen');
    } else if (isLoggedIn) {
      router.replace('/(tabs)'); // đúng → app/(tabs)/index.tsx
    } else {
      router.replace('/(auth)/Login'); // đúng → app/(auth)/Login.tsx
    }
  }, [isLoggedIn, isAuthLoaded, isOnboardingComplete, mounted]);

  return <Slot />;
}
