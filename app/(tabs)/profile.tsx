import { View, Text, Button } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile</Text>
      <Button title="Đăng xuất" onPress={handleLogout} />
    </View>
  );
}
