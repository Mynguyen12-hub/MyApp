import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Flower2, Eye, EyeOff } from 'lucide-react-native';

interface AuthScreenProps {
  onLogin: () => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = () => {
    onLogin();
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

      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, isLogin && styles.activeToggle]}
          onPress={() => setIsLogin(true)}
        >
          <Text style={isLogin ? styles.activeToggleText : styles.inactiveToggleText}>
            Đăng Nhập
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !isLogin && styles.activeToggle]}
          onPress={() => setIsLogin(false)}
        >
          <Text style={!isLogin ? styles.activeToggleText : styles.inactiveToggleText}>
            Đăng Ký
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {!isLogin && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và Tên</Text>
            <TextInput
              style={styles.input}
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật Khẩu</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </TouchableOpacity>
          </View>
        </View>

        {isLogin && (
          <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
            <Text style={{ color: '#ec4899' }}>Quên Mật Khẩu?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
          </Text>
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
  toggleContainer: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 50, padding: 4, marginBottom: 24 },
  toggleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 50 },
  activeToggle: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  activeToggleText: { color: '#111827', fontWeight: 'bold' },
  inactiveToggleText: { color: '#9ca3af' },
  form: { backgroundColor: 'white', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  inputGroup: { marginBottom: 16 },
  label: { marginBottom: 4, color: '#374151' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12 },
  submitButton: { backgroundColor: '#f472b6', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
