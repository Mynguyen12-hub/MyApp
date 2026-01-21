import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "@/config/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const sendResetEmail = async () => {
    setError("");

    if (!email.includes("@")) {
      setError("Email không hợp lệ");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Thành công",
        "Firebase đã gửi link đổi mật khẩu về email của bạn"
      );
      router.back();
    } catch (err) {
      setError("Email không tồn tại hoặc lỗi hệ thống");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={26} color="#ec4899" />
        </TouchableOpacity>
        <Text style={styles.title}>Quên mật khẩu</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nhập email đã đăng ký"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={sendResetEmail}>
        <Text style={styles.buttonText}>Gửi link đổi mật khẩu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff0f6",
    padding: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 60,
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  error: {
    color: "#ef4444",
    marginBottom: 8,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#f472b6",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
