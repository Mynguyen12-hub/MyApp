import { Slot } from "expo-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthScreen from "./(auth)/AuthScreen";
import TabLayout from "./(tabs)/TabLayout";

function RootNavigation() {
  const { isLoggedIn, login } = useAuth();

  return isLoggedIn ? <TabLayout /> : <AuthScreen onLogin={login} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
