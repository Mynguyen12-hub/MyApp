import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ChevronRight, MapPin, Package } from "lucide-react-native";
import { PaymentMethodsScreen, PaymentMethod } from "@/components/PaymentMethods";
import { useRouter } from "expo-router";

export default function CheckoutScreen() {
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "1",
      type: "card",
      name: "Visa Mastercard",
      provider: "Ngân hàng Vietcombank",
      last4: "1234",
      expiryDate: "12/25",
      cardBrand: "💳",
      isDefault: true,
      isFavorite: true,
      status: "active",
    },
    {
      id: "2",
      type: "momo",
      name: "Ví MoMo",
      provider: "MoMo Vietnam",
      isDefault: false,
      isFavorite: true,
      status: "active",
    },
    {
      id: "3",
      type: "bank",
      name: "Chuyển khoản ngân hàng",
      provider: "TPBank",
      bank: "TPBank - Kỹ Thuật Công Nghệ",
      isDefault: false,
      isFavorite: false,
      status: "active",
    },
    {
      id: "4",
      type: "card",
      name: "AMEX",
      provider: "Ngân hàng ACB",
      last4: "5678",
      expiryDate: "08/24",
      cardBrand: "💳",
      isDefault: false,
      isFavorite: false,
      status: "expiring",
    },
    {
      id: "5",
      type: "cod",
      name: "Thanh toán khi nhận hàng",
      provider: "COD",
      isDefault: false,
      isFavorite: false,
      status: "active",
    },
  ];

  const handleSelectPayment = (method: PaymentMethod) => {
    setSelectedPayment(method);
    setShowPaymentModal(false);
  };

  const handleCheckout = () => {
    if (!selectedPayment) {
      Alert.alert("Thông báo", "Vui lòng chọn phương thức thanh toán");
      return;
    }
    Alert.alert("Thành công", `Đặt hàng với ${selectedPayment.name}`);
  };

  if (showPaymentModal) {
    return (
      <PaymentMethodsScreen
        methods={paymentMethods}
        onBack={() => setShowPaymentModal(false)}
        onSelectMethod={handleSelectPayment}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đơn hàng của bạn</Text>

          {/* Order Items */}
          <View style={styles.orderItem}>
            <View style={styles.itemIcon}>
              <Package size={24} color="#fff" />
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>Sản phẩm 1</Text>
              <Text style={styles.itemDescription}>Số lượng: 2</Text>
            </View>
            <Text style={styles.itemPrice}>250.000₫</Text>
          </View>

          <View style={styles.orderItem}>
            <View style={[styles.itemIcon, { backgroundColor: "#3b82f6" }]}>
              <Package size={24} color="#fff" />
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>Sản phẩm 2</Text>
              <Text style={styles.itemDescription}>Số lượng: 1</Text>
            </View>
            <Text style={styles.itemPrice}>150.000₫</Text>
          </View>

          {/* Summary */}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>400.000₫</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>25.000₫</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelBold}>Tổng cộng</Text>
            <Text style={styles.summaryValueBold}>425.000₫</Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <TouchableOpacity>
              <Text style={styles.editLink}>Thay đổi</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressCard}>
            <MapPin size={20} color="#ef4444" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressName}>Nguyễn Văn A</Text>
              <Text style={styles.addressText}>
                123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM
              </Text>
              <Text style={styles.addressPhone}>0901234567</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowPaymentModal(true)}
            style={styles.paymentCard}
          >
            <View style={styles.paymentContent}>
              {selectedPayment ? (
                <>
                  <View style={styles.paymentIcon}>
                    <Text style={styles.paymentIconText}>
                      {selectedPayment.type === "card"
                        ? "💳"
                        : selectedPayment.type === "momo"
                        ? "📱"
                        : selectedPayment.type === "bank"
                        ? "🏦"
                        : "💵"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentName}>
                      {selectedPayment.name}
                    </Text>
                    <Text style={styles.paymentProvider}>
                      {selectedPayment.provider}
                    </Text>
                    {selectedPayment.last4 && (
                      <Text style={styles.paymentLast4}>
                        •••• {selectedPayment.last4}
                      </Text>
                    )}
                  </View>
                  <ChevronRight size={20} color="#9ca3af" />
                </>
              ) : (
                <>
                  <View style={[styles.paymentIcon, { opacity: 0.5 }]}>
                    <Text style={styles.paymentIconText}>💳</Text>
                  </View>
                  <Text style={styles.placeholderText}>
                    Chọn phương thức thanh toán
                  </Text>
                  <ChevronRight size={20} color="#9ca3af" />
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mã khuyến mãi</Text>
          <TouchableOpacity style={styles.promoCard}>
            <Text style={styles.promoText}>Nhập mã khuyến mãi (nếu có)</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCheckout}
          style={[
            styles.checkoutBtn,
            !selectedPayment && styles.checkoutBtnDisabled,
          ]}
          disabled={!selectedPayment}
        >
          <Text style={styles.checkoutBtnText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  editLink: {
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "500",
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
  },
  summaryLabelBold: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  summaryValueBold: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  addressCard: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginTop: 8,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 12,
    color: "#9ca3af",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    marginTop: 8,
  },
  paymentContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentIconText: {
    fontSize: 24,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  paymentProvider: {
    fontSize: 12,
    color: "#6b7280",
  },
  paymentLast4: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
    color: "#9ca3af",
  },
  promoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    marginTop: 8,
  },
  promoText: {
    flex: 1,
    fontSize: 14,
    color: "#9ca3af",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  checkoutBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ef4444",
  },
  checkoutBtnDisabled: {
    backgroundColor: "#fca5a5",
  },
  checkoutBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
