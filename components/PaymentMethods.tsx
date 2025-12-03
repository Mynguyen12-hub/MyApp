// PaymentMethodsScreen.tsx
import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { ArrowLeft, Plus, CreditCard } from "lucide-react-native";

interface PaymentMethod {
  id: string;
  type: "cod" | "momo" | "bank" | "card";
  name?: string;
  isDefault?: boolean;
  last4?: string; // dành cho thẻ card
  cardType?: string; // dành cho thẻ card
}

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  onBack: () => void;
}

export function PaymentMethodsScreen({ methods, onBack }: PaymentMethodsProps) {
  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={20} color="#e91e63" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Methods</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Payment Methods List */}
      <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
        {methods.map((method) => (
          <View key={method.id} style={styles.methodCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              {/* ICON */}
              {method.type === "card" ? (
                <View style={styles.cardIcon}>
                  <CreditCard size={16} color="#fff" />
                </View>
              ) : method.type === "cod" ? (
                <View style={styles.codIcon}>
                  <Text style={{ color: "#fff", fontSize: 12 }}>COD</Text>
                </View>
              ) : method.type === "momo" ? (
                <View style={styles.momoIcon}>
                  <Text style={{ color: "#fff", fontSize: 12 }}>MoMo</Text>
                </View>
              ) : method.type === "bank" ? (
                <View style={styles.bankIcon}>
                  <Text style={{ color: "#fff", fontSize: 12 }}>Bank</Text>
                </View>
              ) : null}

              {/* DETAILS */}
              <View style={{ flex: 1 }}>
                {method.type === "card" && (
                  <>
                    <Text style={styles.methodName}>•••• {method.last4}</Text>
                    <Text style={styles.methodType}>{method.cardType}</Text>
                  </>
                )}
                {method.type === "cod" && <Text style={styles.methodName}>Thanh toán khi nhận hàng</Text>}
                {method.type === "momo" && <Text style={styles.methodName}>Thanh toán qua MoMo</Text>}
                {method.type === "bank" && <Text style={styles.methodName}>Chuyển khoản ngân hàng</Text>}
              </View>

              {/* DEFAULT BADGE */}
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={{ fontSize: 10, color: "#e91e63" }}>Default</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtn: {
    width: 36,
    height: 36,
    backgroundColor: "#e91e63",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  methodCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  cardIcon: {
    width: 48,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  codIcon: {
    width: 48,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
  },
  momoIcon: {
    width: 48,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#ff3b30",
    justifyContent: "center",
    alignItems: "center",
  },
  bankIcon: {
    width: 48,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  methodName: {
    fontWeight: "600",
  },
  methodType: {
    fontSize: 12,
    color: "#555",
  },
  defaultBadge: {
    backgroundColor: "#ffe4e6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
});
