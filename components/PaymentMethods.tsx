import { useNavigation } from "@react-navigation/native";
import { Check, ChevronDown, Heart, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface PaymentMethod {
  id: string;
  type: "card" | "momo" | "bank" | "cod";
  name: string;
  description?: string;
  provider?: string;
  last4?: string;
  expiryDate?: string;
  isDefault?: boolean;
  isFavorite?: boolean;
  status?: "active" | "expired" | "expiring";
}

interface Props {
  methods: PaymentMethod[];
  cartItems: any[];
  totalPrice: number;
  onBack: () => void;
}

export function PaymentMethodsScreen({
  methods,
  cartItems,
  totalPrice,
  onBack,
}: Props) {
  const navigation = useNavigation<any>();

  const [selectedMethod, setSelectedMethod] = useState<string | null>(
    methods.find((m) => m.isDefault)?.id || null
  );

  const [expandedGroups, setExpandedGroups] = useState({
    recommended: true,
    card: true,
    digital: true,
    other: true,
  });

  const toggleGroup = (key: keyof typeof expandedGroups) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const recommendedMethods = methods.filter(
    (m) => m.isDefault || m.isFavorite
  );
  const cardMethods = methods.filter((m) => m.type === "card");
  const digitalMethods = methods.filter(
    (m) => m.type === "momo" || m.type === "bank"
  );
  const otherMethods = methods.filter((m) => m.type === "cod");

  const renderMethodCard = (method: PaymentMethod, highlight = false) => {
    const isSelected = selectedMethod === method.id;

    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.methodCard,
          highlight && styles.methodCardHighlight,
          isSelected && styles.methodCardSelected,
        ]}
        onPress={() => setSelectedMethod(method.id)}
      >
        <View style={styles.methodRow}>
          <Text style={styles.icon}>
            {method.type === "card"
              ? "💳"
              : method.type === "momo"
              ? "📱"
              : method.type === "bank"
              ? "🏦"
              : "💵"}
          </Text>

          <View style={{ flex: 1 }}>
            <Text style={styles.methodName}>{method.name}</Text>
            {method.provider && (
              <Text style={styles.methodSub}>{method.provider}</Text>
            )}
          </View>

          {method.isFavorite && (
            <Heart size={16} color="#ef4444" fill="#ef4444" />
          )}

          <View
            style={[
              styles.radio,
              isSelected && styles.radioSelected,
            ]}
          >
            {isSelected && <Check size={12} color="#fff" />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroup = (
    title: string,
    data: PaymentMethod[],
    key: keyof typeof expandedGroups,
    highlight = false
  ) => {
    if (data.length === 0) return null;

    return (
      <View style={{ marginBottom: 16 }}>
        <TouchableOpacity
          style={[
            styles.groupHeader,
            highlight && styles.groupHeaderHighlight,
          ]}
          onPress={() => toggleGroup(key)}
        >
          <Text
            style={[
              styles.groupTitle,
              highlight && { color: "#fff" },
            ]}
          >
            {title}
          </Text>
          <ChevronDown
            size={18}
            color={highlight ? "#fff" : "#6b7280"}
            style={{
              transform: [
                { rotate: expandedGroups[key] ? "0deg" : "-90deg" },
              ],
            }}
          />
        </TouchableOpacity>

        {expandedGroups[key] &&
          data.map((m) => renderMethodCard(m, highlight))}
      </View>
    );
  };

  /** 🔥 XÁC NHẬN THANH TOÁN */
  const handleConfirm = () => {
    const selected = methods.find((m) => m.id === selectedMethod);
    if (!selected) return;

    if (selected.type === "momo") {
      navigation.navigate("MomoPayment", {
        items: cartItems,
        totalAmount: totalPrice,
      });
    }

    if (selected.type === "bank") {
      navigation.navigate("BankQrPayment", {
        items: cartItems,
        totalAmount: totalPrice,
      });
    }

    if (selected.type === "cod") {
      navigation.navigate("OrderSuccess", {
        paymentMethod: "cod",
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Phương thức thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Search size={16} color="#9ca3af" />
        <TextInput
          placeholder="Tìm phương thức..."
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>

      {/* LIST */}
      <ScrollView style={{ padding: 16 }}>
        {renderGroup("Đề xuất", recommendedMethods, "recommended", true)}
        {renderGroup("Thẻ", cardMethods, "card")}
        {renderGroup("Ví & Ngân hàng", digitalMethods, "digital")}
        {renderGroup("Khác", otherMethods, "other")}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onBack}>
          <Text>Đóng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmBtn,
            !selectedMethod && { backgroundColor: "#fca5a5" },
          ]}
          disabled={!selectedMethod}
          onPress={handleConfirm}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            Xác nhận
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
  },

  back: { fontSize: 18 },
  title: { fontWeight: "600", fontSize: 16 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },

  groupHeader: {
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  groupHeaderHighlight: {
    backgroundColor: "#3b82f6",
  },

  groupTitle: {
    fontWeight: "600",
    color: "#374151",
  },

  methodCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  methodCardHighlight: {
    borderColor: "#3b82f6",
  },

  methodCardSelected: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },

  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  icon: { fontSize: 24 },
  methodName: { fontWeight: "600" },
  methodSub: { fontSize: 12, color: "#6b7280" },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },

  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
  },

  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },

  confirmBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
});
