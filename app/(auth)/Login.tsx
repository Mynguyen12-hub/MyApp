import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, Flower2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from "../../config/firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

const handleLogin = async () => {
  setErrorMessage("");

  if (!email.trim()) {
    setErrorMessage("Vui lòng nhập email");
    return;
  }

  if (!password.trim()) {
    setErrorMessage("Vui lòng nhập mật khẩu");
    return;
  }

  try {
    await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    Alert.alert(
      "Đăng nhập thành công 🎉",
      "Chào mừng bạn quay trở lại!",
      [
        {
          text: "OK",
          onPress: () => {
            router.replace("/(tabs)");
          },
        },
      ],
      { cancelable: false }
    );

  } catch (error: any) {
    console.log("Login error:", error.code);

    switch (error.code) {
      case "auth/user-not-found":
        setErrorMessage("Email chưa được đăng ký");
        break;
      case "auth/wrong-password":
        setErrorMessage("Mật khẩu không chính xác");
        break;
      case "auth/invalid-email":
        setErrorMessage("Email không hợp lệ");
        break;
      case "auth/user-disabled":
        setErrorMessage("Tài khoản đã bị vô hiệu hóa");
        break;
      case "auth/too-many-requests":
        setErrorMessage("Quá nhiều lần thử, vui lòng thử lại sau");
        break;
      default:
        setErrorMessage("Đăng nhập thất bại");
    }
  }
};

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Flower2 size={40} color="white" />
        </View>
        <Text style={styles.title}>Cửa Hàng Hoa</Text>
        <Text style={styles.subtitle}>Hoa tươi giao tận nơi</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật Khẩu</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 16 }} onPress={() => router.push('/(auth)/ForgotPassword')}>
          <Text style={{ color: '#ec4899' }}>Quên Mật Khẩu?</Text>
        </TouchableOpacity>

        {errorMessage ? (
          <View style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#ef4444' }}>
            <Text style={{ color: '#991b1b', fontSize: 13 }}>{errorMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
          <Text style={styles.submitButtonText}>Đăng Nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/Register')}>
          <Text style={styles.switchText}>Chưa có tài khoản? Đăng Ký</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff0f6', paddingHorizontal: 16, paddingBottom: 20},
  header: { alignItems: 'center', paddingVertical: 100 },
  logoContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#f472b6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280' },
  form: { backgroundColor: 'white', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  inputGroup: { marginBottom: 16 },
  label: { marginBottom: 4, color: '#374151' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12 },
  submitButton: { backgroundColor: '#f472b6', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  switchText: { marginTop: 12, color: '#ec4899', textAlign: 'center' },
});
