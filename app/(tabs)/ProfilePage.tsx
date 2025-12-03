// ProfileScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AddressManagement } from "../../components/Address";
import { Notifications } from "../../components/Notifications";
import { UserInfo } from '../context/AuthContext';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault?: boolean;
}

interface ProfileProps {
  onOrdersClick: () => void;
  onWishlistClick: () => void;
  onPaymentsClick: () => void;
  onNotificationsClick: () => void;
  orderCount: number;
  wishlistCount: number;
  unreadCount: number;
  onLogout: () => void;
  user: UserInfo | null;
}

export function ProfilePage({
  onOrdersClick,
  onWishlistClick,
  onPaymentsClick,
  onNotificationsClick,
  orderCount,
  wishlistCount,
  unreadCount,
  onLogout,
  user
}: ProfileProps) {
  const [showAddresses, setShowAddresses] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "Office",
      street: "123 Main Street",
      city: "Ho Chi Minh City",
      state: "HCM",
      zip: "70000",
      phone: "+84 123 456 789",
      isDefault: true,
    },
    {
      id: "2",
      name: "My Home",
      street: "456 Nguyen Hue Boulevard",
      city: "Da Nang",
      state: "DA",
      zip: "50000",
      phone: "+84 987 654 321",
    },
    {
      id: "3",
      name: "Grandmothers house",
      street: "789 Tran Hung Dao Street",
      city: "Hanoi",
      state: "HN",
      zip: "10000",
      phone: "+84 555 666 777",
    },
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: 'order' as const,
      title: "Đơn hàng được xác nhận",
      message: "Đơn hàng #ORD123 của bạn đã được xác nhận",
      time: "2 phút trước",
      read: false,
    },
    {
      id: "2",
      type: 'promotion' as const,
      title: "Khuyến mãi mới",
      message: "Giảm 50% cho tất cả hoa tươi hôm nay",
      time: "1 giờ trước",
      read: false,
    },
    {
      id: "3",
      type: 'delivery' as const,
      title: "Đơn hàng đang giao",
      message: "Đơn hàng #ORD122 của bạn sẽ giao trong 2 giờ",
      time: "3 giờ trước",
      read: true,
    },
  ]);

  if (showNotifications) {
    return (
      <Notifications
        notifications={notifications}
        onBack={() => setShowNotifications(false)}
        onMarkRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        }}
        onClearAll={() => {
          setNotifications([]);
        }}
      />
    );
  }

  if (showAddresses) {
    return (
      <AddressManagement
        addresses={addresses}
        onBack={() => setShowAddresses(false)}
        onSelectAddress={(address) => {
          console.log("Selected address:", address);
          setShowAddresses(false);
        }}
        onAddAddress={() => {
          console.log("Add new address");
        }}
      />
    );
  }

  const menuItems = [
    { 
      icon: "package", 
      label: 'My Orders', 
      color: '#9d72ff', 
      onPress: onOrdersClick, 
      badge: orderCount 
    },
    { 
      icon: "heart", 
      label: 'Wishlist', 
      color: '#f43f5e', 
      onPress: onWishlistClick, 
      badge: wishlistCount 
    },
    { 
      icon: "location", 
      label: 'Delivery Address', 
      color: '#3b82f6', 
      onPress: () => setShowAddresses(true)
    },
    { 
      icon: "card", 
      label: 'Payment Methods', 
      color: '#22c55e', 
      onPress: onPaymentsClick 
    },
    { 
      icon: "notifications", 
      label: 'Notifications', 
      color: '#f59e0b', 
      onPress: () => setShowNotifications(true), 
      badge: unreadCount 
    },
    { 
      icon: "help-circle", 
      label: 'Help & Support', 
      color: '#06b6d4', 
      onPress: () => {} 
    },
    { 
      icon: "settings", 
      label: 'Settings', 
      color: '#52525b', 
      onPress: () => {} 
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header / Profile Card */}
      <View style={styles.header}>

        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user?.name || 'Chưa đăng nhập'}</Text>
              <Text style={styles.email}>{user?.email || ''}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{orderCount}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{wishlistCount}</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>850</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>
        </View>

        {/* Rewards Card */}
        <View style={styles.rewardsCard}>
          <View style={styles.rewardsHeader}>
            <Text style={styles.rewardsText}>Rewards Points</Text>
            <Ionicons name="gift" size={20} color="#fff" />
          </View>
          <Text style={styles.rewardsValue}>850</Text>
          <Text style={styles.rewardsSubText}>150 points to next reward!</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} onPress={item.onPress} style={styles.menuItem}>
            <Ionicons size={20} name={item.icon as any} color={item.color} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.badge !== undefined && item.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' ,top:30},
  header: { padding: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16
  },
  profileInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f43f5e', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24 },
  name: { fontSize: 18, fontWeight: '600' },
  email: { fontSize: 14, color: '#52525b' },
  stats: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#fcd5d7', paddingTop: 12 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '600', color: '#f43f5e' },
  statLabel: { fontSize: 12, color: '#52525b' },
  rewardsCard: {
    backgroundColor: '#f43f5e',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16
  },
  rewardsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rewardsText: { fontSize: 14, opacity: 0.9, color: '#fff' },
  rewardsValue: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 4 },
  rewardsSubText: { fontSize: 14, opacity: 0.9, color: '#fff' },
  menuContainer: { paddingHorizontal: 16, marginBottom: 32 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, marginBottom: 8 },
  menuLabel: { flex: 1, marginLeft: 12, fontSize: 16 },
  badge: { backgroundColor: '#f43f5e', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  logoutBtn: { marginTop: 16, padding: 16, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, alignItems: 'center' },
  logoutText: { color: '#f43f5e', fontWeight: '700', fontSize: 16 }
});
