import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Toast } from '../../components/Toast';

// Use your machine IP instead of localhost for emulator/device communication
const BACKEND_URL = 'http://172.29.16.1:3000';
const FIREBASE_API_KEY = 'AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const toastRef = useRef<any>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  const [step, setStep] = useState<'email-phone' | 'otp' | 'reset'>('email-phone');
  const [forgotEmail, setForgotEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [sendingEmailReset, setSendingEmailReset] = useState(false);
  const [sendingSmsMock, setSendingSmsMock] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };


  // Firebase email password reset
  const handleSendPasswordResetEmail = async () => {
    setErrorMessage('');
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setErrorMessage('Vui lòng nhập email hợp lệ');
      return;
    }
    setSendingEmailReset(true);
    try {
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'PASSWORD_RESET', email: forgotEmail }),
      });
      const data = await res.json();
      if (data.email) {
        Alert.alert('Thành công', 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư đến.');
        router.back();
      } else {
        const err = data.error?.message || 'Không thể gửi email';
        setErrorMessage(err);
      }
    } catch (e) {
      setErrorMessage('Lỗi gửi email, thử lại sau');
    } finally {
      setSendingEmailReset(false);
    }
  };

  // Mock SMS OTP
  const handleSendSmsMock = () => {
    setErrorMessage('');
    if (!forgotEmail || forgotEmail.trim().length < 5) {
      const msg = 'Vui lòng nhập email hoặc số điện thoại hợp lệ';
      setErrorMessage(msg);
      showToast(msg, 'warning');
      return;
    }
    setSendingSmsMock(true);
    setTimeout(() => {
      const otp = generateOtp();
      setGeneratedOtp(otp);
      setOtpExpiry(Date.now() + 5 * 60 * 1000);
      setOtpAttempts(0);
      setStep('otp');
      setSendingSmsMock(false);
      console.log('Mock SMS OTP:', otp);
      showToast(`📱 OTP đã được gửi: ${otp}`, 'success');
    }, 800);
  };

  const handleVerifyOtp = () => {
    setErrorMessage('');
    if (!enteredOtp) {
      const msg = 'Vui lòng nhập mã OTP';
      setErrorMessage(msg);
      showToast(msg, 'warning');
      return;
    }
    if (otpExpiry && Date.now() > otpExpiry) {
      const msg = 'Mã OTP đã hết hạn. Vui lòng gửi lại.';
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }
    if (otpAttempts >= 5) {
      const msg = 'Bạn đã hết lượt thử. Vui lòng gửi lại OTP.';
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }
    if (enteredOtp.trim() === generatedOtp) {
      setStep('reset');
      setEnteredOtp('');
      showToast('✓ OTP đúng! Tiếp tục đặt mật khẩu mới', 'success');
    } else {
      const newAttempts = otpAttempts + 1;
      setOtpAttempts(newAttempts);
      const msg = `❌ Mã OTP không đúng. Lượt thử: ${newAttempts}/5`;
      setErrorMessage(msg);
      showToast(msg, 'error');
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage('');
    if (!newPassword || newPassword.length < 6) {
      const msg = 'Mật khẩu phải có ít nhất 6 ký tự';
      setErrorMessage(msg);
      showToast(msg, 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = 'Mật khẩu xác nhận không khớp';
      setErrorMessage(msg);
      showToast(msg, 'warning');
      return;
    }

    setIsResettingPassword(true);
    try {
      console.log(`[Reset Password] Calling backend: ${BACKEND_URL}/api/resetPassword`);
      console.log(`[Reset Password] Email: ${forgotEmail}`);

      const response = await fetch(`${BACKEND_URL}/api/resetPassword`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotEmail,
          newPassword: newPassword,
        }),
      });

      console.log(`[Reset Password] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('[Reset Password] Error response:', errorData);
        const errMsg = `❌ ${errorData.message || 'Không thể cập nhật mật khẩu'}`;
        setErrorMessage(errMsg);
        showToast(errMsg, 'error');
        setIsResettingPassword(false);
        return;
      }

      const data = await response.json();
      console.log('[Reset Password] Success response:', data);

      showToast('✓ Mật khẩu đã được cập nhật thành công!', 'success');
      
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error('[Reset Password] Error:', error);
      const errMsg = `❌ Lỗi kết nối: ${(error as Error).message}`;
      setErrorMessage(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleResendOtp = () => {
    setStep('email-phone');
    setEnteredOtp('');
    setErrorMessage('');
    handleSendSmsMock();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color="#ec4899" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {step === 'email-phone' ? 'Quên Mật Khẩu' : step === 'otp' ? 'Nhập mã OTP' : 'Đặt lại Mật Khẩu'}
        </Text>
      </View>

      {/* Step 1: Email/Phone */}
      {step === 'email-phone' && (
        <View style={styles.form}>
          <Text style={styles.subtitle}>Nhập email hoặc số điện thoại liên kết với tài khoản</Text>
          <TextInput
            value={forgotEmail}
            onChangeText={setForgotEmail}
            placeholder="email@example.com hoặc 09xxxxxxxx"
            style={[styles.input, { marginBottom: 16 }]}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <TouchableOpacity style={styles.submitButton} onPress={handleSendPasswordResetEmail} disabled={sendingEmailReset}>
            {sendingEmailReset ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Gửi Email Đặt Lại</Text>
            )}
          </TouchableOpacity>
          <View style={styles.divider}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
            <Text style={{ marginHorizontal: 8, color: '#6b7280' }}>hoặc</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
          </View>
          <TouchableOpacity style={[styles.submitButton, { backgroundColor: '#3b82f6' }]} onPress={handleSendSmsMock} disabled={sendingSmsMock}>
            {sendingSmsMock ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Gửi OTP qua SMS (mock)</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: OTP */}
      {step === 'otp' && (
        <View style={styles.form}>
          <Text style={styles.subtitle}>Chúng tôi đã gửi mã tới {forgotEmail}</Text>
          <TextInput
            value={enteredOtp}
            onChangeText={setEnteredOtp}
            placeholder="Nhập 6 chữ số"
            style={[styles.input, { marginBottom: 12 }]}
            keyboardType="numeric"
            editable={true}
            maxLength={6}
          />
          {otpExpiry ? (
            <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
              Mã sẽ hết hạn vào: {new Date(otpExpiry).toLocaleTimeString()}
            </Text>
          ) : null}
          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
            Lượt thử còn lại: {Math.max(0, 5 - otpAttempts)}
          </Text>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {((otpExpiry && Date.now() > otpExpiry) || otpAttempts >= 5) ? (
            <TouchableOpacity style={[styles.submitButton, { backgroundColor: '#3b82f6' }]} onPress={handleResendOtp}>
              <Text style={styles.submitButtonText}>Gửi lại mã OTP</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleVerifyOtp}>
              <Text style={styles.submitButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Step 3: Reset Password */}
      {step === 'reset' && (
        <View style={styles.form}>
          <Text style={styles.subtitle}>Nhập mật khẩu mới cho tài khoản của bạn</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Mật khẩu mới"
            style={[styles.input, { marginBottom: 12 }]}
            secureTextEntry
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Xác nhận mật khẩu"
            style={[styles.input, { marginBottom: 16 }]}
            secureTextEntry
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <TouchableOpacity style={styles.submitButton} onPress={handleResetPassword} disabled={isResettingPassword}>
            {isResettingPassword ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Cập nhật Mật Khẩu</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff0f6', paddingHorizontal: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
    paddingTop:45,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  form: { backgroundColor: 'white', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  errorText: { color: '#ef4444', marginBottom: 12, fontSize: 13 },
  submitButton: { backgroundColor: '#f472b6', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
});
