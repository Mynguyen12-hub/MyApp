import Ionicons from "@expo/vector-icons/Ionicons";
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../app/context/AuthContext";
import { app } from "../config/firebaseConfig";

/* ================= TYPES ================= */

export interface OrderItem {
  id: string;
  date: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingId?: string;
  shippingAddress?: string;
  note?: string;
}

interface OrdersListProps {
  onBack: () => void;
status?: string | null;
}

/* ================= STATUS CONFIG ================= */
const getStatusConfig = (status?: string) => {
  return statusConfig[status ?? "pending"] ?? statusConfig["pending"];
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: string; bgColor: string }
> = {
  pending: {
    label: "Chờ xác nhận",
    color: "#f59e0b",
    icon: "hourglass",
    bgColor: "#fef3c7",
  },
  processing: {
    label: "Đang xử lý",
    color: "#3b82f6",
    icon: "time",
    bgColor: "#dbeafe",
  },
  shipped: {
    label: "Chờ giao hàng",
    color: "#8b5cf6",
    icon: "send",
    bgColor: "#ede9fe",
  },
  delivered: {
    label: "Đã giao",
    color: "#10b981",
    icon: "checkmark-circle",
    bgColor: "#d1fae5",
  },
  cancelled: {
    label: "Đã huỷ",
    color: "#ef4444",
    icon: "close-circle",
    bgColor: "#fee2e2",
  },
};

/* ================= MAIN COMPONENT ================= */

export function OrdersList({ onBack, status }: OrdersListProps) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
const filteredOrders = status
  ? orders.filter((o) => o.status === status)
  : orders;

  /* ===== REALTIME FETCH FROM FIREBASE ===== */
const { user } = useAuth();

useEffect(() => {
  if (!user?.uid) {
    setLoading(false);
    return;
  }

  const db = getFirestore(app);

  const q = query(
    collection(db, "orders"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: OrderItem[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          date: d.createdAt?.toDate?.().toLocaleString() ?? "",
items: (d.items ?? []).map((item: any) => ({
  ...item,
  imageUrl: item.imageUrl || item.image_url || item.image || "",
})),
          total: d.total ?? 0,
          note: d.note ?? "",
          status: d.status ?? "pending",
          shippingAddress: d.address
            ? `${d.address.street}, ${d.address.city}`
            : "",
        };
      });

      setOrders(list);
      setLoading(false);
    },
    (error) => {
      console.log("❌ Lỗi lấy đơn:", error);
      setLoading(false);
    }
  );

  return () => unsubscribe();
}, [user?.uid]);

  /* ===== LOADING ===== */
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={{ marginTop: 10, color: "#999" }}>
          Đang tải đơn hàng...
        </Text>
      </View>
    );
  }

  /* ================= DETAIL VIEW ================= */
  if (selectedOrder) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setSelectedOrder(null)}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.content}>
          {/* Thông tin chung */}
          <View style={[styles.infoCard, {marginBottom: 12}]}> 
            <Text style={{fontWeight:'700', fontSize:16, marginBottom:4}}>Mã đơn: <Text style={{color:'#e91e63'}}>{selectedOrder.id}</Text></Text>
            <Text>Ngày đặt: <Text style={{color:'#3b82f6'}}>{selectedOrder.date}</Text></Text>
            {selectedOrder.trackingId && (
              <Text>Mã vận đơn: <Text style={{color:'#8b5cf6'}}>{selectedOrder.trackingId}</Text></Text>
            )}
            <Text>Trạng thái: <Text style={{color: statusConfig[selectedOrder.status].color}}>{statusConfig[selectedOrder.status].label}</Text></Text>
          </View>
          {/* Địa chỉ giao hàng */}
          {selectedOrder.shippingAddress && (
            <View style={[styles.infoCard, {marginBottom: 12, flexDirection:'row', alignItems:'center'}]}>
              <Ionicons name="location" size={20} color="#3b82f6" style={{marginRight:8}} />
              <Text style={{flex:1}}>Địa chỉ giao: <Text style={{color:'#52525b'}}>{selectedOrder.shippingAddress}</Text></Text>
            </View>
          )}
          {/* Trạng thái badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig[selectedOrder.status].bgColor },
            ]}
          >
            <Ionicons
              name={statusConfig[selectedOrder.status].icon as any}
              size={20}
              color={statusConfig[selectedOrder.status].color}
            />
            <Text style={{ color: statusConfig[selectedOrder.status].color, fontWeight:'700' }}>
              {statusConfig[selectedOrder.status].label}
            </Text>
          </View>
          {/* Danh sách sản phẩm */}
          <View style={[styles.itemsCard, {marginBottom:12}]}> 
            <Text style={{fontWeight:'700', fontSize:15, marginBottom:8}}>Sản phẩm</Text>
            {selectedOrder.items.map((item, idx) => (
              <View key={`${item.id}-${idx}`} style={[styles.itemRow, {alignItems:'center', marginBottom:idx===selectedOrder.items.length-1?0:10}]}> 
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              ) : (
                <View
                  style={[
                    styles.itemImage,
                    {
                      backgroundColor: "#eee",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Ionicons name="image" size={20} color="#bbb" />
                </View>
              )}
                <View style={{flex:1, marginLeft:8}}>
                  <Text style={{fontWeight:'600'}}>{item.name}</Text>
                  <Text style={{color:'#666'}}>Số lượng: {item.quantity}</Text>
                </View>
                <Text style={{fontWeight:'600', color:'#e91e63'}}>₫ {(item.price * item.quantity).toLocaleString()}</Text>
              </View>
            ))}
          </View>
          {/* Tổng tiền */}
          <View style={[styles.totalCard, {marginBottom:12, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}]}>
            <Text style={{fontWeight:'700', fontSize:16}}>Tổng cộng</Text>
            <Text style={styles.totalValue}>₫ {selectedOrder.total.toLocaleString()}</Text>
          </View>
          {/* Thông tin bổ sung */}
          <View style={[styles.infoCard, {marginBottom:24}]}> 
            <Text>Phương thức thanh toán: <Text style={{color:'#3b82f6'}}>Tiền mặt khi nhận hàng</Text></Text>
          <Text>
            Ghi chú:{" "}
            <Text style={{ color: "#52525b" }}>
              {selectedOrder.note?.trim() || "Không có"}
            </Text>
          </Text>
                    </View>
        </ScrollView>
      </View>
    );
  }

  /* ================= LIST VIEW ================= */

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={{ width: 24 }} />
      </View>
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#ddd" />
          <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={[styles.orderCard, {borderLeftWidth:4, borderLeftColor: getStatusConfig(order.status).color, shadowColor: getStatusConfig(order.status).color, shadowOpacity:0.08, shadowRadius:8}]}
              onPress={() => setSelectedOrder(order)}
              activeOpacity={0.85}
            >
              <View style={{flexDirection:'row', alignItems:'center', marginBottom:6}}>
                <Ionicons name={getStatusConfig(order.status).icon as any} size={20} color={getStatusConfig(order.status).color} style={{marginRight:8}} />
                <Text style={{fontWeight:'700', fontSize:15, flex:1}}>Đơn #{order.id}</Text>
                <Text style={{color: getStatusConfig(order.status).color, fontWeight:'600'}}>{getStatusConfig(order.status).label}</Text>
              </View>
              <Text style={{color:'#666', marginBottom:2}}>Ngày đặt: {order.date}</Text>
              {order.shippingAddress && <Text style={{color:'#666', marginBottom:2}}>Địa chỉ: {order.shippingAddress}</Text>}
              <Text style={{color:'#666', marginBottom:2}}>Số sản phẩm: {order.items.length}</Text>
              <Text style={styles.orderTotal}>Tổng: ₫ {order.total.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 22,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  content: { padding: 16 },
  orderCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  orderId: { fontWeight: "700" },
  orderTotal: { color: "#e91e63", marginTop: 6 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 12, color: "#999" },
  infoCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12 },
  statusBadge: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
    justifyContent: "center",
  },
  itemsCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12 },
  itemRow: { flexDirection: "row", marginBottom: 8 },
  itemImage: { width: 40, height: 40, marginRight: 8 },
  totalCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12 },
  totalValue: { fontSize: 18, fontWeight: "700", color: "#e91e63" },
});
