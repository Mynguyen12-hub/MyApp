import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Flower2, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const BACKEND_URL = 'http://localhost:3000';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    setErrorMessage("");

    // Validate input
    if (!name.trim()) {
      setErrorMessage("Vui lòng nhập họ tên");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập email");
      return;
    }
    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsRegistering(true);

    try {
      // Try backend first (if available)
      try {
        const backendRes = await fetch(`${BACKEND_URL}/api/createTestUser`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
            displayName: name.trim(),
          }),
        });

        const backendData = await backendRes.json();
        if (backendData.success) {
          Alert.alert('✓ Thành công', 'Tài khoản đã được tạo! Vui lòng đăng nhập.', [
            { text: 'OK', onPress: () => router.replace('/(auth)/Login') }
          ]);
          return;
        }
      } catch (e) {
        // Backend not available, fallback to Firebase REST
        console.log("Backend not available, using Firebase REST API");
      }

      // Firebase REST API fallback
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
            displayName: name.trim(),
            returnSecureToken: true,
          }),
        }
      );

      const result = await response.json();

      if (result.idToken) {
        Alert.alert('✓ Thành công', 'Tài khoản đã được tạo! Vui lòng đăng nhập.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/Login') }
        ]);
      } else {
        const err = result.error?.message || 'Đăng ký thất bại';
        if (err.includes('EMAIL_EXISTS')) {
          setErrorMessage('Email này đã được đăng ký');
        } else {
          setErrorMessage(err);
        }
      }
    } catch (error) {
      setErrorMessage('Lỗi kết nối. Vui lòng kiểm tra mạng.');
      console.error('Register error:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <ArrowLeft size={28} color="#ec4899" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Flower2 size={40} color="white" />
        </View>
        <Text style={styles.title}>Đăng Ký Tài Khoản</Text>
        <Text style={styles.subtitle}>Tạo tài khoản để mua sắm</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và Tên</Text>
          <TextInput
            style={styles.input}
            placeholder="Nguyễn Văn A"
            value={name}
            onChangeText={setName}
          />
        </View>

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
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Xác Nhận Mật Khẩu</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </TouchableOpacity>
          </View>
        </View>

        {errorMessage ? (
          <View style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#ef4444' }}>
            <Text style={{ color: '#991b1b', fontSize: 13 }}>{errorMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.submitButton} onPress={handleRegister} disabled={isRegistering}>
          {isRegistering ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Tạo Tài Khoản</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/Login')}>
          <Text style={styles.switchText}>Đã có tài khoản? Đăng Nhập</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff0f6', paddingHorizontal: 16, paddingBottom: 32 },
  header: { alignItems: 'center', paddingVertical: 24 },
  logoContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#f472b6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280' },
  form: { backgroundColor: 'white', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  inputGroup: { marginBottom: 16 },
  label: { marginBottom: 4, color: '#374151', fontWeight: '500' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12 },
  submitButton: { backgroundColor: '#f472b6', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  switchText: { marginTop: 12, color: '#ec4899', textAlign: 'center', fontSize: 14 },
});
