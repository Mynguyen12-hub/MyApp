import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ================= TYPES ================= */

export interface Promotion {
  id: string;
  code: string;
  type: "freeship" | "percent";
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
}

/* ================= PROPS ================= */

interface PromotionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    freeshipPromo: Promotion | null,
    percentPromo: Promotion | null
  ) => void;
  selectedFreeshipId?: string;
  selectedPercentId?: string;
}

/* ================= COMPONENT ================= */

export function PromotionsModal({
  visible,
  onClose,
  onConfirm,
  selectedFreeshipId,
  selectedPercentId,
}: PromotionsModalProps) {
  const [freeshipPromos, setFreeshipPromos] = useState<Promotion[]>([]);
  const [percentPromos, setPercentPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);

  const [tempFreeshipId, setTempFreeshipId] = useState<string | undefined>();
  const [tempPercentId, setTempPercentId] = useState<string | undefined>();

  /* ================= LOAD FROM FIREBASE ================= */

  useEffect(() => {
    if (!visible) return;

    setTempFreeshipId(selectedFreeshipId);
    setTempPercentId(selectedPercentId);

    const loadVouchers = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://firestore.googleapis.com/v1/projects/flower-30f60/databases/(default)/documents/vouchers"
        );
        const json = await res.json();

        const docs = json.documents ?? [];

        const promos: Promotion[] = docs
          .map((doc: any) => {
            const f = doc.fields;
            if (!f) return null;
            if (f.active?.booleanValue !== true) return null;

            return {
              id: doc.name.split("/").pop(),
              code: f.code?.stringValue ?? "",
              type: f.type?.stringValue as "freeship" | "percent",
              discountValue: Number(
                f.discountValue?.integerValue ??
                  f.discountValue?.doubleValue ??
                  0
              ),
              minOrder: f.minOrder
                ? Number(f.minOrder.integerValue)
                : undefined,
              maxDiscount: f.maxDiscount
                ? Number(f.maxDiscount.integerValue)
                : undefined,
            } as Promotion;
          })
          .filter(Boolean) as Promotion[];

        setFreeshipPromos(promos.filter((p) => p.type === "freeship"));
        setPercentPromos(promos.filter((p) => p.type === "percent"));
      } catch (e) {
        console.log("Load vouchers error", e);
      } finally {
        setLoading(false);
      }
    };

    loadVouchers();
  }, [visible, selectedFreeshipId, selectedPercentId]);

  /* ================= ACTION ================= */

  const confirm = () => {
    const freeship =
      freeshipPromos.find((p) => p.id === tempFreeshipId) ?? null;
    const percent =
      percentPromos.find((p) => p.id === tempPercentId) ?? null;

    onConfirm(freeship, percent);
    onClose();
  };

  /* ================= RENDER ITEM ================= */

  const renderPromo = (
    item: Promotion,
    selectedId?: string,
    onSelect?: () => void
  ) => {
    const selected = item.id === selectedId;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.card, selected && styles.cardActive]}
        onPress={onSelect}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.code}>{item.code}</Text>

          {item.type === "freeship" ? (
            <Text style={styles.desc}>
              Miễn phí giao hàng tối đa{" "}
              {item.discountValue.toLocaleString()}đ
            </Text>
          ) : (
            <Text style={styles.desc}>
              Giảm {item.discountValue}% – tối đa{" "}
              {item.maxDiscount?.toLocaleString()}đ
            </Text>
          )}

          {item.minOrder ? (
            <Text style={styles.min}>
              Đơn tối thiểu {item.minOrder.toLocaleString()}đ
            </Text>
          ) : null}
        </View>

        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color="#e91e63"
          />
        )}
      </TouchableOpacity>
    );
  };

  /* ================= UI ================= */

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} />
          </TouchableOpacity>

          <Text style={styles.title}>Chọn khuyến mãi</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading && <Text style={{ padding: 16 }}>Đang tải...</Text>}

        <FlatList
          data={[
            { title: "Miễn phí giao hàng", data: freeshipPromos },
            { title: "Giảm giá", data: percentPromos },
          ]}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <View style={{ padding: 16 }}>
              <Text style={styles.section}>{item.title}</Text>

              {item.data.map((p) =>
                renderPromo(
                  p,
                  p.type === "freeship"
                    ? tempFreeshipId
                    : tempPercentId,
                  () =>
                    p.type === "freeship"
                      ? setTempFreeshipId(p.id)
                      : setTempPercentId(p.id)
                )
              )}
            </View>
          )}
        />

        <TouchableOpacity style={styles.confirm} onPress={confirm}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            Áp dụng
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "700" },
  section: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  cardActive: {
    borderColor: "#e91e63",
    backgroundColor: "#fff5f7",
  },
  code: { fontWeight: "700", fontSize: 14 },
  desc: { fontSize: 13, color: "#555", marginTop: 2 },
  min: { fontSize: 12, color: "#999", marginTop: 2 },
  confirm: {
    margin: 16,
    backgroundColor: "#e91e63",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});
