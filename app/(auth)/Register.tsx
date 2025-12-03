import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Flower2, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const { login } = useAuth();
//   const router = useRouter();
//   const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

//   const handleRegister = () => {
//     login(); // tự động login
//     router.replace('/(tabs)'); // chuyển sang TabLayout
//   };

   const handleRegister = async () => {
  if (!email.trim() || !password) {
    alert("Vui lòng nhập email và mật khẩu!");
    return;
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          returnSecureToken: true,
        }),
      }
    );

   

      const result = await response.json();

      if (result.idToken) {
        console.log("Đăng ký thành công:", result.email);
        router.replace("/(auth)/Login");
      } else {
        console.log("Lỗi đăng ký:", result.error?.message);
      }
    } catch (error) {
      console.log("Lỗi kết nối:", (error as any).message);
    }
  };

  const handleLogin = () => {
    router.push("/(auth)/Login");
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
        <Text style={styles.title}>Đăng Ký Tài Khoản</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và Tên</Text>
          <TextInput
            // style={styles.input}
            // placeholder="Nguyễn Văn A"
            // value={formData.name}
            // onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            // keyboardType="email-address"
            // value={formData.email}
            // onChangeText={(text) => setFormData({ ...formData, email: text })}
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
            //   secureTextEntry={!showPassword}
            //   value={formData.password}
            //   onChangeText={(text) => setFormData({ ...formData, password: text })}
            value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </TouchableOpacity>
          </View>
        </View>

<TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
        <Text style={styles.submitButtonText}>Tạo Tài Khoản</Text>
      </TouchableOpacity>
<TouchableOpacity onPress={() => router.push('/(auth)/Login')}>
        <Text style={styles.switchText}>Đã có tài khoản? Đăng Nhập</Text>
      </TouchableOpacity>      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff0f6', paddingHorizontal: 16, paddingBottom: 32 },
  header: { alignItems: 'center', paddingVertical: 32 },
  logoContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#f472b6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  form: { backgroundColor: 'white', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  inputGroup: { marginBottom: 16 },
  label: { marginBottom: 4, color: '#374151' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12 },
  submitButton: { backgroundColor: '#f472b6', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  switchText: { marginTop: 12, color: '#ec4899', textAlign: 'center' },
});
