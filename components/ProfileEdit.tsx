import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { UserInfo } from "../app/context/AuthContext";

interface ProfileEditProps {
  user: UserInfo | null;
  onBack: () => void;
  onSave: (user: UserInfo) => void;
}

export function ProfileEdit({ user, onBack, onSave }: ProfileEditProps) {
  const [formName, setFormName] = useState(user?.name || "");
  const [formEmail, setFormEmail] = useState(user?.email || "");
  const [formPhone, setFormPhone] = useState(user?.phone || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!formName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên");
      return;
    }
    if (!formEmail.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    setIsSaving(true);
    // Simulate save delay
    setTimeout(() => {
      const updatedUser: UserInfo = {
        ...user,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
      } as UserInfo;
      onSave(updatedUser);
      setIsSaving(false);
    }, 500);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>{formName}</Text>
          <Text style={styles.userEmail}>{formEmail}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Name Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={18} color="#e91e63" />
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                value={formName}
                onChangeText={setFormName}
                placeholderTextColor="#ccc"
              />
            </View>
          </View>

          {/* Email Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={18} color="#e91e63" />
              <TextInput
                style={styles.input}
                placeholder="Nhập email"
                value={formEmail}
                onChangeText={setFormEmail}
                keyboardType="email-address"
                placeholderTextColor="#ccc"
              />
            </View>
          </View>

          {/* Phone Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call" size={18} color="#e91e63" />
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                value={formPhone}
                onChangeText={setFormPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#ccc"
              />
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginTop: 22,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  content: { flex: 1, paddingVertical: 16 },

  // Profile Card
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 24,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e91e63",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 32 },
  userName: { fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 4 },
  userEmail: { fontSize: 14, color: "#666" },

  // Form Section
  formSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  formGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },

  // Footer
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  saveBtn: {
    backgroundColor: "#e91e63",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
