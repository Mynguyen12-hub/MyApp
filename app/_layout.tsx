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

    // If user is not logged in, show Onboarding first (per request)
    if (!isLoggedIn) {
      router.replace('/(onboarding)/OnboardingScreen');
      return;
    }

    // If logged in but onboarding not complete, show onboarding
    if (!isOnboardingComplete) {
      router.replace('/(onboarding)/OnboardingScreen');
      return;
    }

    // Otherwise go to main tabs
    router.replace('/(tabs)'); // app/(tabs)/index.tsx
  }, [isLoggedIn, isAuthLoaded, isOnboardingComplete, mounted]);

  return <Slot />;
}
