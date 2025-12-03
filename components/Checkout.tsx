// CheckoutScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";

// --- DEFINE TYPES TRỰC TIẾP TRONG FILE ---
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

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

interface PaymentMethod {
  id: string;
  type: "cod" | "momo" | "bank" | "card" | "paypal";
  isDefault?: boolean;
  last4?: string;    // với thẻ card
  cardType?: string; // với thẻ card
}

interface CheckoutProps {
  items: CartItem[];
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  onBack: () => void;
  onPlaceOrder: (address: Address, payment: PaymentMethod, discount: number) => void;
}

// --- MAIN COMPONENT ---
export function Checkout({
  items,
  addresses,
  paymentMethods,
  onBack,
  onPlaceOrder,
}: CheckoutProps) {
  const [step, setStep] = useState<'checkout' | 'payment' | 'success'>('checkout');
  const [selectedAddress, setSelectedAddress] = useState<Address>(
    addresses.find((a) => a.isDefault) || addresses[0]
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(
    paymentMethods.find((p) => p.isDefault) || paymentMethods[0]
  );
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = 5;
  const total = subtotal + delivery - promoDiscount;

  const applyPromoCode = () => {
    if (promoCode.trim().toUpperCase() === 'SAVE10') setPromoDiscount(subtotal * 0.1);
    else if (promoCode.trim().toUpperCase() === 'FLOWER20') setPromoDiscount(subtotal * 0.2);
    else setPromoDiscount(0);
  };

  const proceedToPayment = () => {
    setStep('payment');
  };

  const confirmPayment = () => {
    // call parent handler to create order and close modal
    onPlaceOrder(selectedAddress, selectedPayment, promoDiscount);
    // optionally show success locally (parent currently closes modal)
    setStep('success');
  };

  if (step === 'success') {
    return (
      <View style={styles.successContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backSmall}>
          <ArrowLeft size={18} color="#e91e63" />
        </TouchableOpacity>
        <View style={styles.successCard}>
          <Text style={styles.successEmoji}>💖</Text>
          <Text style={styles.successTitle}>Payment Success</Text>
          <Text style={styles.successText}>Your payment was successful!{`\n`}An order was created and you'll receive updates shortly.</Text>
          <TouchableOpacity style={styles.trackBtn} onPress={() => { /* navigate to orders if needed */ }}>
            <Text style={styles.trackBtnText}>Track Order Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backHomeBtn} onPress={onBack}>
            <Text style={styles.backHomeText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}
      >
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={20} color="#e91e63" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check Out</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Address Section */}
        <View style={styles.cardRow}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              onPress={() => setSelectedAddress(address)}
              style={[
                styles.addressCard,
                selectedAddress.id === address.id && styles.addressCardActive,
              ]}
            >
              <View>
                <Text style={styles.addressName}>{address.name}</Text>
                <Text style={styles.addressText}>{address.street}</Text>
                <Text style={styles.addressText}>{address.city}, {address.state} {address.zip}</Text>
              </View>
              <Text style={styles.addressPhone}>{address.phone}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.cardRow}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          {items.map((item) => (
            <View key={item.id} style={styles.orderRow}>
              <Text style={styles.orderText}>{item.name} x{item.quantity}</Text>
              <Text style={styles.orderText}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery</Text>
            <Text style={styles.priceValue}>${delivery.toFixed(2)}</Text>
          </View>
          {promoDiscount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: '#16a34a' }]}>Discount</Text>
              <Text style={[styles.priceValue, { color: '#16a34a' }]}>-${promoDiscount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>

          {/* Voucher */}
          <View style={styles.voucherRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter voucher code"
              value={promoCode}
              onChangeText={setPromoCode}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={applyPromoCode}>
              <Text style={styles.applyText}>Use</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Footer actions */}
      {step === 'checkout' && (
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerPrice}>${total.toFixed(2)}</Text>
            <Text style={styles.footerSubtitle}>incl. delivery</Text>
          </View>
          <TouchableOpacity style={styles.confirmBtn} onPress={proceedToPayment}>
            <Text style={styles.confirmBtnText}>Confirm Payment</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'payment' && (
        <View style={styles.paymentContainer}>
          <Text style={styles.sectionTitle}>Select Payment</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setSelectedPayment(method)}
              style={[styles.paymentItem, selectedPayment.id === method.id && styles.paymentItemActive]}
            >
              <Text style={styles.paymentText}>{method.type === 'cod' ? 'Cash on Delivery' : method.type === 'momo' ? 'MoMo' : method.type === 'bank' ? 'Bank Transfer' : method.type === 'card' ? `•••• ${method.last4}` : 'PayPal'}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.confirmPaymentBtn} onPress={confirmPayment}>
            <Text style={styles.confirmPaymentText}>Confirm Payment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  cardRow: { marginBottom: 16, backgroundColor: '#fff' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  editText: { color: '#e91e63', fontWeight: '600' },
  addressCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff5f7',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffe4ed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressCardActive: { backgroundColor: '#fff0f4', borderColor: '#f9c5d1' },
  addressName: { fontWeight: '700', color: '#333' },
  addressText: { color: '#666', fontSize: 13 },
  addressPhone: { color: '#666', fontSize: 13 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  orderText: { color: '#444' },
  divider: { height: 1, backgroundColor: '#f3e7ea', marginVertical: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  priceLabel: { color: '#666' },
  priceValue: { color: '#666' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 0 },
  totalLabel: { fontWeight: '700', color: '#333' },
  totalValue: { fontWeight: '700', color: '#e91e63' },
  voucherRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#f3d6df',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  applyBtn: { backgroundColor: '#e91e63', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginLeft: 8 },
  applyText: { color: '#fff', fontWeight: '700' },

  footer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderColor: '#f3e7ea', backgroundColor: '#fff' },
  footerLeft: { flex: 1 },
  footerPrice: { fontSize: 18, fontWeight: '700', color: '#333' },
  footerSubtitle: { fontSize: 12, color: '#999' },
  confirmBtn: { backgroundColor: '#e91e63', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  confirmBtnText: { color: '#fff', fontWeight: '700' },

  paymentContainer: { padding: 16, backgroundColor: '#fff' },
  paymentItem: { padding: 12, borderRadius: 10, backgroundColor: '#fff5f7', marginBottom: 8, borderWidth: 1, borderColor: '#ffe4ed' },
  paymentItemActive: { borderColor: '#f9c5d1', backgroundColor: '#fff0f4' },
  paymentText: { color: '#333' },
  confirmPaymentBtn: { marginTop: 12, backgroundColor: '#e91e63', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  confirmPaymentText: { color: '#fff', fontWeight: '700' },

  // success screen
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  backSmall: { position: 'absolute', top: 24, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  successCard: { width: '100%', maxWidth: 420, alignItems: 'center', backgroundColor: '#fff5fb', padding: 28, borderRadius: 20, borderWidth: 1, borderColor: '#ffe4ed' },
  successEmoji: { fontSize: 48 },
  successTitle: { fontSize: 22, fontWeight: '700', marginTop: 12, color: '#333' },
  successText: { textAlign: 'center', color: '#666', marginTop: 8 },
  trackBtn: { marginTop: 16, backgroundColor: '#e91e63', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  trackBtnText: { color: '#fff', fontWeight: '700' },
  backHomeBtn: { marginTop: 10, paddingVertical: 12, paddingHorizontal: 20 },
  backHomeText: { color: '#e91e63', fontWeight: '700' },

});
