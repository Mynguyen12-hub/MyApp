import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [isSaving, setIsSaving] = useState(false);

  // =====================
  // 📷 Chụp ảnh
  // =====================
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Cần quyền truy cập camera");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  // =====================
  // 🖼️ Chọn ảnh từ thư viện
  // =====================
  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Cần quyền truy cập thư viện ảnh");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  // =====================
  // 💾 Lưu thông tin
  // =====================
  const handleSave = () => {
    if (!formName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên");
      return;
    }
    if (!formEmail.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }
    if (formPhone && formPhone.length < 9) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    const updatedUser: UserInfo = {
      ...user,
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      avatar, // ✅ lưu avatar
    } as UserInfo;

    setIsSaving(true);

    setTimeout(() => {
      onSave(updatedUser);
      setIsSaving(false);
    }, 500);
  };

  return (
    <View style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ===== Avatar ===== */}
        <View style={{ alignItems: "center" }}>
          <View style={styles.avatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>👤</Text>
            )}
          </View>

          <View style={styles.avatarActions}>
            <TouchableOpacity onPress={takePhoto}>
              <Text style={styles.avatarActionText}>📷 Chụp ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.avatarActionText}>🖼️ Chọn ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== Form ===== */}
        <View style={styles.formSection}>
          {/* Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={18} color="#e91e63" />
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                value={formName}
                onChangeText={setFormName}
              />
            </View>
          </View>

          {/* Email */}
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
              />
            </View>
          </View>

          {/* Phone */}
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
              />
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ===== Footer ===== */}
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

// =====================
// 🎨 Styles
// =====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 22,
  },

  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700" },

  content: { flex: 1, paddingVertical: 16 },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e91e63",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  avatarText: { fontSize: 32 },

  avatarActions: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },

  avatarActionText: {
    color: "#e91e63",
    fontWeight: "600",
    fontSize: 13,
  },

  formSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },

  formGroup: { marginBottom: 16 },
  label: { fontWeight: "600", marginBottom: 8 },

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

  input: { flex: 1, marginLeft: 8 },

  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  saveBtn: {
    backgroundColor: "#e91e63",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
