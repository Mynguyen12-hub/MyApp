import React from "react";
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { CartItem } from "../app/(tabs)/index";

interface CartDrawerProps {
  visible: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemoveItem: (id: number) => void;
  totalPrice: number;
  onCheckout: () => void; // thêm đây
}

export function CartDrawer({
  visible,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  totalPrice,
  onCheckout, // destructure đúng
}: CartDrawerProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      </View>
      <View style={styles.drawer}>
        <View style={styles.header}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Giỏ Hàng</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.empty}>
            <Text>Giỏ hàng trống</Text>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Image source={item.image} style={styles.itemImage} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text numberOfLines={1}>{item.name}</Text>
                  <Text>{item.price.toLocaleString()}₫</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                    <TouchableOpacity onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                      <Feather name="minus" size={20} />
                    </TouchableOpacity>
                    <Text style={{ marginHorizontal: 8 }}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                      <Feather name="plus" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={() => onRemoveItem(item.id)}>
                  <Feather name="trash-2" size={20} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {cartItems.length > 0 && (
          <View style={styles.footer}>
            <Text>Tổng: {totalPrice.toLocaleString()}₫</Text>
            <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
              <Text style={{ color: "white", fontWeight: "bold" }}>Thanh Toán</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  drawer: { position: "absolute", top: 30, right: 0, bottom: 0, width: "80%", backgroundColor: "#fff", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  item: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  itemImage: { width: 60, height: 60, borderRadius: 8 },
  footer: { marginTop: 16 },
  checkoutBtn: { marginTop: 8, backgroundColor: "#e91e63", padding: 12, borderRadius: 8, alignItems: "center" },
});
