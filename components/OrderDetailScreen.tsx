import Ionicons from "@expo/vector-icons/Ionicons";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { app } from "../config/firebaseConfig";

/* =======================
   MAP STATUS
======================= */
const mapStatus = (status: any) => {
  if (status === null || status === undefined) return "pending";

  if (typeof status === "number") {
    return ["pending", "processing", "shipped", "delivered", "cancelled"][
      status
    ] || "pending";
  }

  const s = String(status).toLowerCase();
  if (["pending", "chờ xác nhận"].includes(s)) return "pending";
  if (["processing", "đang xử lý"].includes(s)) return "processing";
  if (["shipped", "chờ giao hàng"].includes(s)) return "shipped";
  if (["delivered", "đã giao"].includes(s)) return "delivered";
  if (["cancelled", "đã huỷ", "đã hủy"].includes(s)) return "cancelled";

  return "pending";
};

/* =======================
   STATUS UI
======================= */
const statusConfig: any = {
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

export default function OrderDetailScreen({ route, navigation }: any) {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const db = getFirestore(app);
      const ref = doc(db, "orders", route.params.order.id);
      const snap = await getDoc(ref);
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
    };
    fetchOrder();
  }, []);

  if (!order) return null;

  const status = mapStatus(order.status);
  const ui = statusConfig[status];
  const isReviewed = order.isReviewed === true;

  /* =======================
     HỦY ĐƠN
  ======================= */
  const handleCancel = async () => {
    Alert.alert("Xác nhận", "Bạn muốn hủy đơn?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy",
        style: "destructive",
        onPress: async () => {
          const db = getFirestore(app);
          await updateDoc(doc(db, "orders", order.id), {
            status: "cancelled",
          });
          setOrder({ ...order, status: "cancelled" });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đơn hàng #{order.id}</Text>

      <View style={[styles.statusBadge, { backgroundColor: ui.bgColor }]}>
        <Ionicons name={ui.icon} size={18} color={ui.color} />
        <Text style={{ color: ui.color, fontWeight: "700", marginLeft: 6 }}>
          {ui.label}
        </Text>
      </View>

      <FlatList
        data={order.items}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontWeight: "600" }}>{item.name}</Text>
              <Text>Số lượng: {item.quantity}</Text>
            </View>
            <Text style={{ color: "#e91e63", fontWeight: "600" }}>
              {(item.price * item.quantity).toLocaleString()}đ
            </Text>
          </View>
        )}
      />

      <Text style={styles.total}>
        Tổng: {order.total.toLocaleString()}đ
      </Text>

      {(status === "pending" || status === "processing") && (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.btnText}>Hủy đơn</Text>
        </TouchableOpacity>
      )}

      {status === "delivered" && !isReviewed && (
        <TouchableOpacity
          style={styles.reviewBtn}
          onPress={() =>
            navigation.navigate("ReviewScreen", {
              orderId: order.id,
              items: order.items,
            })
          }
        >
          <Text style={styles.btnText}>Đánh giá sản phẩm</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: "bold" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    marginVertical: 10,
  },
  itemRow: { flexDirection: "row", paddingVertical: 8 },
  itemImage: { width: 40, height: 40, borderRadius: 8 },
  total: { textAlign: "right", fontWeight: "bold", marginTop: 8 },
  cancelBtn: {
    marginTop: 16,
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  reviewBtn: {
    marginTop: 12,
    backgroundColor: "#10b981",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
