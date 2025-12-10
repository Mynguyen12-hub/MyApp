import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Flower2, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { login, setUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");
    
    // Validate input
    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập email");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Vui lòng nhập mật khẩu");
      return;
    }
    
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password,
            returnSecureToken: true,
          }),
        }
      );
      const result = await response.json();

      console.log("Firebase response:", result);

      if (result.idToken) {
        console.log("Đăng nhập thành công:", result.email);
        await login();
        await setUser({
          name: result.displayName || result.email.split('@')[0],
          email: result.email,
        });
        router.replace("/(tabs)");
      } else {
        // Extract error message from Firebase response
        const errorMsg = result.error?.message;
        console.log("Firebase error:", errorMsg);
        
        // Firebase error codes
        if (errorMsg?.includes("EMAIL_NOT_FOUND")) {
          setErrorMessage("Email này chưa được đăng ký");
        } else if (errorMsg?.includes("INVALID_PASSWORD")) {
          setErrorMessage("Mật khẩu không chính xác");
        } else if (errorMsg?.includes("INVALID_EMAIL")) {
          setErrorMessage("Định dạng email không hợp lệ");
        } else if (errorMsg?.includes("USER_DISABLED")) {
          setErrorMessage("Tài khoản này đã bị vô hiệu hóa");
        } else if (errorMsg?.includes("TOO_MANY_ATTEMPTS")) {
          setErrorMessage("Quá nhiều lần thử. Vui lòng thử lại sau.");
        } else {
          setErrorMessage(errorMsg || "Đăng nhập thất bại, vui lòng thử lại");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Lỗi kết nối, vui lòng kiểm tra mạng");
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

        <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>📝 Test Tài Khoản:</Text>
          <Text style={{ fontSize: 12, color: '#374151', fontFamily: 'monospace' }}>Email: test@example.com</Text>
          <Text style={{ fontSize: 12, color: '#374151', fontFamily: 'monospace' }}>Pass: test123456</Text>
          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Hoặc đăng ký tài khoản mới bên dưới</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff0f6', paddingHorizontal: 16, paddingBottom: 32 },
  header: { alignItems: 'center', paddingVertical: 32 },
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
