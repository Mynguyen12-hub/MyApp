// CheckoutScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Address } from "../data/addressData";
import { useAddresses, AddressManagement } from "./Address";

// --- DEFINE TYPES TRỰC TIẾP TRONG FILE ---
interface CartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  image?: any;
}

interface PaymentMethod {
  id: string;
  type: "cod" | "momo" | "bank" | "card" | "paypal";
  label: string;
  isDefault?: boolean;
  last4?: string;
  cardType?: string;
}

interface CheckoutProps {
  items: CartItem[];
  addresses?: Address[];
  paymentMethods: PaymentMethod[];
  onBack: () => void;
  onPlaceOrder: (address: Address, payment: PaymentMethod, discount: number) => void;
  selectedDiscount?: number;
  freeShipping?: boolean;
}

// --- MAIN COMPONENT ---
export function Checkout({
  items,
  addresses: addressesFromProps,
  paymentMethods,
  onBack,
  onPlaceOrder,
  selectedDiscount = 0,
  freeShipping = false,
}: CheckoutProps) {
  // Get addresses from the Address component hook (main source of truth)
  const { addresses: hookAddresses, selectedAddress: hookSelectedAddress } = useAddresses();
  
  // Use hook addresses as primary source, fallback to props if hook is empty
  const addresses = hookAddresses && hookAddresses.length > 0 ? hookAddresses : (addressesFromProps || []);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(hookSelectedAddress || addresses[0] || null);

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(
    paymentMethods.find((p) => p.isDefault) || paymentMethods[0] || {
      id: 'cod',
      type: 'cod',
      label: 'Thanh toán khi nhận hàng',
    }
  );
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [discountCode, setDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  const shippingMethods = [
    { id: 'standard', name: 'Giao hàng tiêu chuẩn', price: 16500, time: '2-3 ngày' },
    { id: 'express', name: 'Giao hàng nhanh', price: 25000, time: '1 ngày' },
    { id: 'same-day', name: 'Giao cùng ngày', price: 45000, time: 'Cùng ngày' },
  ];

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = selectedDiscount;
  const shippingFee = shippingMethods.find(m => m.id === selectedShipping)?.price || 16500;
  const finalShippingFee = freeShipping ? 0 : shippingFee;
  const total = subtotal - discountAmount + finalShippingFee;

  const confirmPayment = () => {
    if (!selectedAddress) {
      alert('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    onPlaceOrder(selectedAddress, selectedPayment, discountAmount);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ===== DELIVERY ADDRESS SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={18} color="#e91e63" />
            <Text style={styles.sectionTitleMain}>Địa chỉ giao hàng</Text>
          </View>
          <TouchableOpacity 
            style={styles.addressBox}
            onPress={() => setShowAddressModal(true)}
          >
            <View style={{ flex: 1 }}>
              {selectedAddress ? (
                <>
                  <Text style={styles.addressName}>{selectedAddress.name}</Text>
                  <Text style={styles.addressDetail}>
                    {selectedAddress.street}, {selectedAddress.city}
                  </Text>
                  <Text style={styles.addressDetail}>Điện thoại: {selectedAddress.phone}</Text>
                </>
              ) : (
                <Text style={styles.addressName}>Chọn địa chỉ giao hàng</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#e91e63" />
          </TouchableOpacity>
        </View>

        {/* ===== DISCOUNT CODE SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={18} color="#e91e63" />
            <Text style={styles.sectionTitleMain}>Mã giảm giá</Text>
          </View>
          <View style={styles.discountInputRow}>
            <TextInput
              style={styles.discountInput}
              placeholder="Nhập mã giảm giá"
              value={discountCode}
              onChangeText={setDiscountCode}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
          {discountMessage ? (
            <Text style={styles.discountMsg}>{discountMessage}</Text>
          ) : null}
        </View>

        {/* ===== SHIPPING METHODS SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car" size={18} color="#e91e63" />
            <Text style={styles.sectionTitleMain}>Phương thức vận chuyển</Text>
          </View>
          {shippingMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setSelectedShipping(method.id)}
              style={[
                styles.shippingMethod,
                selectedShipping === method.id && styles.shippingMethodActive,
              ]}
            >
              <View style={styles.shippingRadio}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedShipping === method.id && styles.radioOuterActive,
                  ]}
                >
                  {selectedShipping === method.id && <View style={styles.radioInner} />}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.shippingName}>{method.name}</Text>
                <Text style={styles.shippingTime}>{method.time}</Text>
              </View>
              <Text style={styles.shippingPrice}>₫ {method.price.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ===== PAYMENT METHODS SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={18} color="#e91e63" />
            <Text style={styles.sectionTitleMain}>Phương thức thanh toán</Text>
          </View>
          {paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                onPress={() => setSelectedPayment(method)}
                style={[
                  styles.paymentMethod,
                  selectedPayment.id === method.id && styles.paymentMethodActive,
                ]}
              >
                <View style={styles.paymentIcon}>
                  <Ionicons
                    name={selectedPayment.id === method.id ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color="#e91e63"
                  />
                </View>
                <Text style={styles.paymentLabel}>{method.label}</Text>
                {method.id === 'spl' && (
                  <View style={styles.badgeShopee}>
                    <Text style={styles.badgeText}>Khuyến mãi</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            // Fallback payment methods if none provided
            [
              { id: 'cod', type: 'cod', label: 'Thanh toán khi nhận hàng' },
              { id: 'momo', type: 'momo', label: 'Ví MoMo' },
              { id: 'bank', type: 'bank', label: 'Chuyển khoản ngân hàng' },
            ].map((method) => (
              <TouchableOpacity
                key={method.id}
                onPress={() => setSelectedPayment(method as PaymentMethod)}
                style={[
                  styles.paymentMethod,
                  selectedPayment.id === method.id && styles.paymentMethodActive,
                ]}
              >
                <View style={styles.paymentIcon}>
                  <Ionicons
                    name={selectedPayment.id === method.id ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color="#e91e63"
                  />
                </View>
                <Text style={styles.paymentLabel}>{method.label}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ===== PAYMENT DETAILS SECTION ===== */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitleMain}>Chi tiết đơn hàng</Text>

          {/* Items List */}
          <View style={styles.itemsCard}>
            {items.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image
                  source={item.image || { uri: 'https://via.placeholder.com/50' }}
                  style={styles.itemImage}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₫ {item.price.toLocaleString()}</Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                  <Text style={styles.itemTotal}>₫ {(item.price * item.quantity).toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Price Breakdown */}
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tổng tiền hàng</Text>
              <Text style={styles.priceValue}>₫ {subtotal.toLocaleString()}</Text>
            </View>

            {discountAmount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Giảm giá</Text>
                <Text style={[styles.priceValue, styles.discountText]}>-₫ {discountAmount.toLocaleString()}</Text>
              </View>
            )}

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Phí vận chuyển</Text>
              <Text style={styles.priceValue}>₫ {finalShippingFee.toLocaleString()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalValue}>₫ {total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer - Confirm Button */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalValue}>₫ {total.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.confirmBtn} onPress={confirmPayment}>
          <Text style={styles.confirmBtnText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>

      {/* ADDRESS MANAGEMENT MODAL - Full Address CRUD Interface */}
      <Modal
        visible={showAddressModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <AddressManagement
          addresses={addresses}
          onBack={() => setShowAddressModal(false)}
          onSelectAddress={(address) => {
            setSelectedAddress(address);
            setShowAddressModal(false);
          }}
          onAddAddress={(newAddress) => {
            // Addresses state should be updated via hook in parent
          }}
          onRemoveAddress={(id) => {
            // Handle address deletion - update hook addresses
          }}
        />
      </Modal>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 22, 
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  content: { flex: 1, paddingVertical: 12 },

  // Section Card
  sectionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitleMain: { fontSize: 16, fontWeight: '700', color: '#333', marginLeft: 8 },

  // Address section
  addressBox: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#e91e63', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addressName: { fontSize: 14, fontWeight: '700', color: '#333' },
  addressDetail: { fontSize: 12, color: '#666', marginTop: 4 },

  // Discount code section
  discountInputRow: { flexDirection: 'row', gap: 8 },
  discountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  applyBtn: { backgroundColor: '#e91e63', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, justifyContent: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  discountMsg: { color: '#e91e63', fontSize: 12, marginTop: 8 },

  // Shipping methods
  shippingMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  shippingMethodActive: { backgroundColor: '#fff5f7', borderColor: '#e91e63' },
  shippingRadio: { marginRight: 12 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  radioOuterActive: { borderColor: '#e91e63' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e91e63' },
  shippingName: { fontSize: 13, fontWeight: '600', color: '#333' },
  shippingTime: { fontSize: 12, color: '#999', marginTop: 2 },
  shippingPrice: { fontSize: 13, fontWeight: '700', color: '#333' },

  // Payment methods
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  paymentMethodActive: { backgroundColor: '#fff5f7', borderColor: '#e91e63' },
  paymentIcon: { marginRight: 12 },
  paymentLabel: { fontSize: 13, fontWeight: '600', color: '#333', flex: 1 },
  badgeShopee: { backgroundColor: '#ffd966', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  badgeText: { color: '#333', fontSize: 10, fontWeight: '600' },

  // Items card
  itemsCard: { marginVertical: 12 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: { width: 50, height: 50, borderRadius: 6, marginRight: 10, backgroundColor: '#f0f0f0' },
  itemName: { fontSize: 12, fontWeight: '600', color: '#333' },
  itemPrice: { fontSize: 12, color: '#e91e63', fontWeight: '600', marginTop: 3 },
  itemRight: { alignItems: 'flex-end', marginLeft: 8 },
  itemTotal: { fontSize: 12, fontWeight: '700', color: '#333' },
  itemQty: { fontSize: 11, color: '#999', marginTop: 2 },
  itemCheckbox: { marginRight: 10 },

  // Price breakdown
  priceBreakdown: { paddingVertical: 12, marginTop: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  priceLabel: { fontSize: 12, color: '#666' },
  priceValue: { fontSize: 12, fontWeight: '600', color: '#333' },
  discountText: { color: '#e91e63' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#333' },
  totalValue: { fontSize: 14, fontWeight: '700', color: '#e91e63' },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerPrice: { flex: 1 },
  confirmBtn: { backgroundColor: '#e91e63', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Success
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  backSmall: { position: 'absolute', top: 20, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  successCard: { backgroundColor: '#fff5f7', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#ffe4ed' },
  successEmoji: { fontSize: 48 },
  successTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 12 },
  successText: { textAlign: 'center', color: '#666', fontSize: 14, marginTop: 8 },
  trackBtn: { marginTop: 16, backgroundColor: '#e91e63', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  trackBtnText: { color: '#fff', fontWeight: '700' },

  // Address Modal
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  modalContent: { flex: 1, paddingVertical: 8, paddingHorizontal: 12 },
  addressListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, marginVertical: 6, borderRadius: 10, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#e0e0e0' },
  addressListItemSelected: { backgroundColor: '#fff5f7', borderColor: '#e91e63' },
  addressListRadio: { marginRight: 12 },
  addressListName: { fontSize: 13, fontWeight: '700', color: '#333' },
  addressListDetail: { fontSize: 12, color: '#666', marginTop: 3 },
  addressListPhone: { fontSize: 12, color: '#999', marginTop: 3 },
  defaultBadge: { backgroundColor: '#e91e63', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginTop: 6, alignSelf: 'flex-start' },
  defaultBadgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  emptyAddressContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyAddressText: { color: '#999', fontSize: 14, marginTop: 12 },
});
