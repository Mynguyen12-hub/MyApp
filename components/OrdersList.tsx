import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface OrderItem {
  id: string;
  date: string;
  items: Array<{ id: number; name: string; quantity: number; price: number; image?: any }>;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingId?: string;
  shippingAddress?: string;
}

interface OrdersListProps {
  orders: OrderItem[];
  onBack: () => void;
}

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
    label: "Đã gửi",
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

export function OrdersList({ orders, onBack }: OrdersListProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  if (selectedOrder) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedOrder(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã đơn hàng</Text>
              <Text style={styles.infoValue}>{selectedOrder.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày đặt</Text>
              <Text style={styles.infoValue}>{selectedOrder.date}</Text>
            </View>
            {selectedOrder.trackingId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mã vận đơn</Text>
                <Text style={styles.infoValue}>{selectedOrder.trackingId}</Text>
              </View>
            )}
          </View>

          {/* Status Badge */}
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
            <Text
              style={[
                styles.statusLabel,
                { color: statusConfig[selectedOrder.status].color },
              ]}
            >
              {statusConfig[selectedOrder.status].label}
            </Text>
          </View>

          {/* Timeline */}
          {selectedOrder.status !== "cancelled" && (
            <View style={styles.timelineContainer}>
              <Text style={styles.timelineTitle}>Quá trình giao hàng</Text>
              <View style={styles.timeline}>
                <TimelineStep
                  icon="checkmark-circle"
                  label="Đã xác nhận"
                  completed={true}
                  time="2 giờ trước"
                />
                <TimelineStep
                  icon="cube"
                  label="Đang chuẩn bị"
                  completed={selectedOrder.status !== "pending"}
                  time={selectedOrder.status !== "pending" ? "1 giờ trước" : "---"}
                />
                <TimelineStep
                  icon="send"
                  label="Đã gửi"
                  completed={["shipped", "delivered"].includes(selectedOrder.status)}
                  time={["shipped", "delivered"].includes(selectedOrder.status) ? "vừa rồi" : "---"}
                />
                <TimelineStep
                  icon="checkmark-circle"
                  label="Đã giao"
                  completed={selectedOrder.status === "delivered"}
                  time={selectedOrder.status === "delivered" ? "vừa rồi" : "---"}
                />
              </View>
            </View>
          )}

          {/* Items */}
          <View style={styles.itemsCard}>
            <Text style={styles.itemsTitle}>Sản phẩm</Text>
            {selectedOrder.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                {item.image && (
                  <Image
                    source={item.image}
                    style={styles.itemImage}
                  />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>₫ {(item.price * item.quantity).toLocaleString()}</Text>
              </View>
            ))}
          </View>

          {/* Address */}
          {selectedOrder.shippingAddress && (
            <View style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Ionicons name="location" size={18} color="#e91e63" />
                <Text style={styles.addressTitle}>Địa chỉ giao hàng</Text>
              </View>
              <Text style={styles.addressText}>{selectedOrder.shippingAddress}</Text>
            </View>
          )}

          {/* Total */}
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>₫ {selectedOrder.total.toLocaleString()}</Text>
            </View>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={{ width: 24 }} />
      </View>

      {orders.length > 0 ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => setSelectedOrder(order)}
              style={styles.orderCard}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Đơn #{order.id}</Text>
                  <Text style={styles.orderDate}>{order.date}</Text>
                </View>
                <View
                  style={[
                    styles.statusChip,
                    { backgroundColor: statusConfig[order.status].bgColor },
                  ]}
                >
                  <Ionicons
                    name={statusConfig[order.status].icon as any}
                    size={16}
                    color={statusConfig[order.status].color}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.statusChipText,
                      { color: statusConfig[order.status].color },
                    ]}
                  >
                    {statusConfig[order.status].label}
                  </Text>
                </View>
              </View>

              <View style={styles.orderItems}>
                <Text style={styles.itemsLabel}>
                  {order.items.length} sản phẩm
                </Text>
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>₫ {order.total.toLocaleString()}</Text>
                <Ionicons name="chevron-forward" size={18} color="#e91e63" />
              </View>
            </TouchableOpacity>
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#ddd" />
          <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
        </View>
      )}
    </View>
  );
}

function TimelineStep({
  icon,
  label,
  completed,
  time,
}: {
  icon: string;
  label: string;
  completed: boolean;
  time: string;
}) {
  return (
    <View style={styles.timelineStep}>
      <View
        style={[
          styles.stepCircle,
          completed && { backgroundColor: "#10b981" },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={completed ? "#fff" : "#ccc"}
        />
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepLabel, completed && { color: "#333" }]}>
          {label}
        </Text>
        <Text style={styles.stepTime}>{time}</Text>
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
  content: { flex: 1, paddingVertical: 12, paddingHorizontal: 16 },

  // Order Card
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderId: { fontSize: 16, fontWeight: "700", color: "#333" },
  orderDate: { fontSize: 12, color: "#999", marginTop: 4 },
  statusChip: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
  },
  statusChipText: { fontSize: 12, fontWeight: "600" },
  orderItems: { marginBottom: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#f0f0f0", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  itemsLabel: { fontSize: 12, color: "#666" },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTotal: { fontSize: 16, fontWeight: "700", color: "#e91e63" },

  // Detail View
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#333" },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  statusLabel: { fontSize: 14, fontWeight: "600" },

  timelineContainer: { marginBottom: 12 },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  timeline: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepContent: { flex: 1 },
  stepLabel: { fontSize: 13, fontWeight: "600", color: "#999" },
  stepTime: { fontSize: 12, color: "#ccc", marginTop: 2 },

  itemsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  itemsTitle: { fontSize: 14, fontWeight: "700", color: "#333", marginBottom: 12 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: "#f0f0f0" },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: "600", color: "#333" },
  itemQty: { fontSize: 12, color: "#999", marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: "700", color: "#333" },

  addressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  addressHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  addressTitle: { fontSize: 14, fontWeight: "700", color: "#333", marginLeft: 8 },
  addressText: { fontSize: 13, color: "#666", lineHeight: 20 },

  totalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 14, fontWeight: "700", color: "#333" },
  totalValue: { fontSize: 18, fontWeight: "700", color: "#e91e63" },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { fontSize: 16, color: "#999", marginTop: 16 },
});
