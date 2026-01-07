import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { ChevronDown, Search, Heart, Check } from "lucide-react-native";

const { width } = Dimensions.get("window");

export interface PaymentMethod {
  id: string;
  type: "card" | "momo" | "bank" | "cod";
  name: string;
  description?: string;
  provider?: string;
  last4?: string;
  expiryDate?: string;
  bank?: string;
  isDefault?: boolean;
  isFavorite?: boolean;
  fees?: string;
  status?: "active" | "expired" | "expiring";
  cardBrand?: string;
}

interface PaymentMethodsScreenProps {
  methods: PaymentMethod[];
  onBack: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
}

export function PaymentMethodsScreen({
  methods,
  onBack,
  onSelectMethod,
}: PaymentMethodsScreenProps) {
  const [expandedGroups, setExpandedGroups] = useState({
    recommended: true,
    card: true,
    digital: true,
    other: false,
  });
  const [selectedMethod, setSelectedMethod] = useState<string | null>(
    methods.find((m) => m.isDefault)?.id || null
  );
  const [searchText, setSearchText] = useState("");

  // Group methods by type
  const recommendedMethods = methods.filter((m) => m.isDefault || m.isFavorite);
  const cardMethods = methods.filter((m) => m.type === "card");
  const digitalMethods = methods.filter(
    (m) => (m.type === "momo" || m.type === "bank") && !m.isDefault
  );
  const otherMethods = methods.filter(
    (m) => m.type === "cod" && !m.isDefault
  );

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "expired":
        return { text: "Hết hạn", color: "#ef4444", bgColor: "#fee2e2" };
      case "expiring":
        return { text: "Sắp hết hạn", color: "#f59e0b", bgColor: "#fef3c7" };
      default:
        return null;
    }
  };

  const toggleGroup = (group: keyof typeof expandedGroups) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const renderMethodCard = (method: PaymentMethod, highlight = false) => {
    const statusBadge = getStatusBadge(method.status);
    const isSelected = selectedMethod === method.id;

    return (
      <TouchableOpacity
        key={method.id}
        onPress={() => setSelectedMethod(method.id)}
        style={[
          styles.methodCard,
          highlight && styles.methodCardHighlight,
          isSelected && styles.methodCardSelected,
        ]}
      >
        <View style={styles.methodCardContent}>
          {/* Left: Icon & Details */}
          <View style={styles.methodLeft}>
            <View
              style={[
                styles.iconWrapper,
                highlight && styles.iconWrapperHighlight,
              ]}
            >
              <Text style={styles.cardIcon}>
                {method.type === "card"
                  ? "💳"
                  : method.type === "momo"
                  ? "📱"
                  : method.type === "bank"
                  ? "🏦"
                  : "💵"}
              </Text>
            </View>

            <View style={styles.methodInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.methodName} numberOfLines={1}>
                  {method.name}
                </Text>
                {method.isDefault && (
                  <View style={styles.defaultLabel}>
                    <Text style={styles.defaultLabelText}>Mặc định</Text>
                  </View>
                )}
              </View>

              {method.provider && (
                <Text style={styles.methodProvider} numberOfLines={1}>
                  {method.provider}
                </Text>
              )}
              {method.last4 && (
                <Text style={styles.methodLast4}>•••• {method.last4}</Text>
              )}
              {method.expiryDate && (
                <Text style={styles.methodExpiry}>{method.expiryDate}</Text>
              )}
            </View>
          </View>

          {/* Right: Badges & Buttons */}
          <View style={styles.methodRight}>
            <View style={styles.badgesAndButtons}>
              {statusBadge && (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusBadge.bgColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: statusBadge.color },
                    ]}
                  >
                    {statusBadge.text}
                  </Text>
                </View>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Heart
                    size={16}
                    color={method.isFavorite ? "#ef4444" : "#d1d5db"}
                    fill={method.isFavorite ? "#ef4444" : "none"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Radio/Checkbox */}
            <View
              style={[
                styles.radioButton,
                isSelected && styles.radioButtonSelected,
              ]}
            >
              {isSelected && (
                <Check size={12} color="#fff" strokeWidth={3} />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroup = (
    title: string,
    items: PaymentMethod[],
    groupKey: keyof typeof expandedGroups,
    highlight = false
  ) => {
    if (items.length === 0) return null;

    const isExpanded = expandedGroups[groupKey];

    return (
      <View key={groupKey} style={styles.group}>
        <TouchableOpacity
          onPress={() => toggleGroup(groupKey)}
          style={[
            styles.groupHeader,
            highlight && styles.groupHeaderHighlight,
          ]}
        >
          <View style={styles.groupTitleContainer}>
            <Text
              style={[
                styles.groupTitle,
                highlight && styles.groupTitleHighlight,
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.groupCount,
                highlight && styles.groupCountHighlight,
              ]}
            >
              {items.length}
            </Text>
          </View>
          <ChevronDown
            size={20}
            color={highlight ? "#fff" : "#6b7280"}
            style={{
              transform: [{ rotate: isExpanded ? "0deg" : "-90deg" }],
            }}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.groupContent}>
            {items.map((method) => renderMethodCard(method, highlight))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm phương thức..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Methods List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Recommended - Highlighted */}
        {recommendedMethods.length > 0 &&
          renderGroup(
            "💡 Được đề xuất",
            recommendedMethods,
            "recommended",
            true
          )}

        {/* Card Methods */}
        {cardMethods.length > 0 &&
          cardMethods.filter((m) => !m.isDefault).length > 0 &&
          renderGroup("Thẻ tín dụng", cardMethods, "card", false)}

        {/* Digital Payment */}
        {digitalMethods.length > 0 &&
          renderGroup("Ví & Ngân hàng", digitalMethods, "digital", false)}

        {/* Other Methods */}
        {otherMethods.length > 0 &&
          renderGroup("Phương thức khác", otherMethods, "other", false)}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={onBack} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Đóng lại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const selected = methods.find((m) => m.id === selectedMethod);
            if (selected) onSelectMethod(selected);
          }}
          disabled={!selectedMethod}
          style={[
            styles.confirmBtn,
            !selectedMethod && styles.confirmBtnDisabled,
          ]}
        >
          <Text style={styles.confirmBtnText}>Xác nhận</Text>
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
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  placeholder: {
    width: 36,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  group: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    marginBottom: 8,
  },
  groupHeaderHighlight: {
    backgroundColor: "#3b82f6",
  },
  groupTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  groupTitleHighlight: {
    color: "#fff",
  },
  groupCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  groupCountHighlight: {
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  groupContent: {
    gap: 10,
  },
  methodCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    marginBottom: 2,
  },
  methodCardHighlight: {
    borderColor: "#3b82f6",
    backgroundColor: "#f0f9ff",
  },
  methodCardSelected: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  methodCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  methodLeft: {
    flexDirection: "row",
    flex: 1,
    gap: 10,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperHighlight: {
    backgroundColor: "#dbeafe",
  },
  cardIcon: {
    fontSize: 28,
  },
  methodInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  methodName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  defaultLabel: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  defaultLabelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#16a34a",
  },
  methodProvider: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  methodLast4: {
    fontSize: 11,
    color: "#9ca3af",
  },
  methodExpiry: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  methodRight: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
  },
  badgesAndButtons: {
    gap: 4,
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 4,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#ef4444",
    backgroundColor: "#ef4444",
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
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ef4444",
  },
  confirmBtnDisabled: {
    backgroundColor: "#fca5a5",
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
