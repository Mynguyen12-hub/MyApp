// ProfileScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AddressManagement } from "../../components/Address";
import { Notifications } from "../../components/Notifications";
import { ProfileEdit } from "../../components/ProfileEdit";
import { OrdersList, OrderItem } from "../../components/OrdersList";
import { UserInfo } from '../context/AuthContext';
import { Address } from '../../data/addressData';

interface ProfileProps {
  onOrdersClick: () => void;
  onWishlistClick: () => void;
  onPaymentsClick: () => void;
  onNotificationsClick: () => void;
  onOpenChat: () => void;
  onOpenCart: () => void;
  orderCount: number;
  wishlistCount: number;
  unreadCount: number;
  onLogout: () => void;
  user: UserInfo | null;
  addresses: Address[];
  onAddressesChange: (addresses: Address[]) => void;
  orders: OrderItem[];
  openNotifications?: boolean;
  onNotificationsHandled?: () => void;
  incomingNotification?: { id: string; type: string; title: string; message: string; time: string; read?: boolean } | null;
  onIncomingHandled?: () => void;
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
  user,
  addresses: initialAddresses,
  onAddressesChange,
  orders,
  onOpenChat,
  onOpenCart,
  openNotifications,
  onNotificationsHandled,
  incomingNotification,
  onIncomingHandled,
}: ProfileProps) {
  const [showAddresses, setShowAddresses] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [userInfo, setUserInfo] = useState(user);

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

  React.useEffect(() => {
    if (openNotifications) {
      setShowNotifications(true);
      if (onNotificationsHandled) onNotificationsHandled();
    }
  }, [openNotifications]);

  React.useEffect(() => {
    if (incomingNotification) {
      setNotifications((prev) => [
        { ...(incomingNotification as any), read: false },
        ...prev,
      ]);
      setShowNotifications(true);
      if (onIncomingHandled) onIncomingHandled();
    }
  }, [incomingNotification]);

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
          setAddresses((prev) => {
            const exists = prev.some((a) => a.id === address.id);
            if (exists) return prev.map((a) => (a.id === address.id ? address : a));
            return [...prev, address];
          });
          setShowAddresses(false);
        }}
        onAddAddress={(address) => {
          if (address) {
            setAddresses((prev) => {
              const exists = prev.some((a) => a.id === address.id);
              if (exists) return prev.map((a) => (a.id === address.id ? address : a));
              return [...prev, address];
            });
            setShowAddresses(false);
            return;
          }
          const newAddr: Address = {
            id: Date.now().toString(),
            name: 'New Address',
            street: 'Street name',
            city: 'City',
            state: '',
            zip: '',
            phone: '',
          };
          setAddresses((prev) => [...prev, newAddr]);
          setShowAddresses(false);
        }}
        onRemoveAddress={(id) => {
          setAddresses((prev) => {
            const filtered = prev.filter((a) => a.id !== id);
            return filtered;
          });
          setTimeout(() => setShowAddresses(false), 300);
        }}
      />
    );
  }

  const menuItems = [
    { 
      icon: "notifications", 
      label: 'Thông báo', 
      color: '#f59e0b', 
      onPress: () => setShowNotifications(true), 
      badge: unreadCount 
    },
    { 
      icon: "heart", 
      label: 'Wishlist', 
      color: '#ff6b81', 
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
      icon: "person-circle", 
      label: 'Edit Profile', 
      color: '#8b5cf6', 
      onPress: () => setShowProfileEdit(true)
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

            {/* Header action buttons: Edit, Chat, Cart */}
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setShowProfileEdit(true)}>
                <Ionicons name="pencil" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={onOpenChat}>
                <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={onOpenCart}>
                <Ionicons name="cart" size={18} color="#fff" />
              </TouchableOpacity>
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

      {/* Order Status Row (Chờ xác nhận, Chờ lấy hàng, Đang giao, Đã giao) */}
      <View style={styles.orderStatusContainer}>
        {(() => {
          const sCount = (key: string) => {
            if (!orders) return 0;
            try {
              return orders.filter((o: any) => o.status === key).length;
            } catch (e) {
              return 0;
            }
          };
          const statuses = [
            { key: 'pending', label: 'Chờ xác nhận' },
            { key: 'processing', label: 'Chờ lấy hàng' },
            { key: 'shipping', label: 'Đang giao' },
            { key: 'delivered', label: 'Đã giao' },
          ];
          return statuses.map((st) => (
            <TouchableOpacity key={st.key} style={styles.statusItem} onPress={() => setShowOrders(true)}>
              <View style={styles.statusCountWrapper}>
                <Text style={styles.statusCount}>{sCount(st.key)}</Text>
              </View>
              <Text style={styles.statusLabel}>{st.label}</Text>
            </TouchableOpacity>
          ));
        })()}
      </View>

      {/* Quick action icons grid */}
      <View style={styles.quickActionsContainer}>
        {[
          { icon: 'bag-add', label: 'Mua hàng' },
          { icon: 'swap-horizontal', label: 'Trả hàng' },
          { icon: 'ticket', label: 'Voucher' },
          { icon: 'card', label: 'Ví của tôi' },
          { icon: 'gift', label: 'Quà' },
          { icon: 'gift-outline', label: 'Ưu đãi' },
          { icon: 'chatbubbles', label: 'Chat' },
          { icon: 'information', label: 'Hỗ trợ' },
        ].map((a) => (
          <TouchableOpacity key={a.label} style={styles.quickAction} onPress={() => { /* noop */ }}>
            <Ionicons name={a.icon as any} size={22} color="#ff6b81" />
            <Text style={styles.quickActionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
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

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileEdit}
        animationType="slide"
        transparent={false}
      >
        <ProfileEdit
          user={userInfo}
          onBack={() => setShowProfileEdit(false)}
          onSave={(updatedUser) => {
            setUserInfo(updatedUser);
            setShowProfileEdit(false);
          }}
        />
      </Modal>

      {/* Orders List Modal */}
      <Modal
        visible={showOrders}
        animationType="slide"
        transparent={false}
      >
        <OrdersList
          orders={orders}
          onBack={() => setShowOrders(false)}
        />
      </Modal>
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
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ff6b81', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24 },
  name: { fontSize: 18, fontWeight: '600' },
  email: { fontSize: 14, color: '#52525b' },
  stats: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#fcd5d7', paddingTop: 12 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '600', color: '#ff6b81' },
  statLabel: { fontSize: 12, color: '#52525b' },
  rewardsCard: {
    backgroundColor: '#ff6b81',
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
  badge: { backgroundColor: '#ff6b81', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  logoutBtn: { marginTop: 16, padding: 16, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, alignItems: 'center' },
  logoutText: { color: '#ff6b81', fontWeight: '700', fontSize: 16 }
  ,
  headerActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  actionBtn: { marginLeft: 8, backgroundColor: '#ff6b81', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  orderStatusContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  statusItem: { alignItems: 'center', flex: 1, paddingVertical: 10 },
  statusCountWrapper: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 6, minWidth: 36, alignItems: 'center' },
  statusCount: { fontSize: 16, fontWeight: '700', color: '#ff6b81' },
  statusLabel: { fontSize: 12, color: '#52525b', textAlign: 'center' },
  quickActionsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 16 },
  quickAction: { width: '25%', padding: 12, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { marginTop: 6, fontSize: 12, color: '#52525b', textAlign: 'center' }
});
