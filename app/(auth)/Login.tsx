import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
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
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );
      const result = await response.json();

      if (result.idToken) {
        console.log("Đăng nhập thành công:", result.email);
        await login();
        await setUser({
          name: result.displayName || result.email.split('@')[0],
          email: result.email,
        });
        router.replace("/(tabs)");
      } else {
        const errorCode = result.error?.message;
        switch (errorCode) {
          case "EMAIL_NOT_FOUND":
            setErrorMessage("Email này chưa được đăng ký");
            break;
          case "INVALID_PASSWORD":
            setErrorMessage("Bạn nhập sai mật khẩu");
            break;
          case "INVALID_EMAIL":
            setErrorMessage("Định dạng email không hợp lệ");
            break;
          case "USER_DISABLED":
            setErrorMessage("Tài khoản này đã bị vô hiệu hóa");
            break;
          default:
            setErrorMessage("Đăng nhập thất bại, vui lòng thử lại");
        }
      }
    } catch (error) {
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

        <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
          <Text style={{ color: '#ec4899' }}>Quên Mật Khẩu?</Text>
        </TouchableOpacity>

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
