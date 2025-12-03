import React from "react";
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ProductCard } from "../../components/ProductCard";
import type { Product } from "./index";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"; // bông hoa

interface FavoritesPageProps {
  favorites: Product[];
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (id: number) => void;
  onPressImage?: (product: Product) => void;
  onPressCart?: () => void; // hàm bấm vào giỏ hàng
}

export function FavoritesPage({
  favorites,
  onAddToCart,
  onToggleFavorite,
  onPressImage,
  onPressCart,
}: FavoritesPageProps) {
  const headerColor = "#FF69B4"; // màu hồng

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header với Cart */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="flower" size={28} color={headerColor} style={{ marginRight: 8 }} />
            <Text style={[styles.headerTitle, { color: headerColor }]}>Sản phẩm yêu thích</Text>
          </View>
          <TouchableOpacity onPress={onPressCart}>
            <Ionicons name="cart-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Nội dung trống */}
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có sản phẩm yêu thích</Text>
          <Text style={styles.emptySubText}>Thêm hoa yêu thích vào danh sách!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header với Cart */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="flower" size={28} color={headerColor} style={{ marginRight: 8 }} />
          <Text style={[styles.headerTitle, { color: headerColor }]}>Sản phẩm yêu thích</Text>
        </View>
        <TouchableOpacity onPress={onPressCart}>
          <Ionicons name="cart-outline" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onAddToCart={onAddToCart}
            isFavorite={true}
            onToggleFavorite={onToggleFavorite}
            onPressImage={() => onPressImage?.(item)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 }, // cách top 30
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    top: 30,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyText: { fontSize: 16, fontWeight: "500", color: "#555", marginBottom: 4 },
  emptySubText: { fontSize: 14, color: "#999", textAlign: "center" },
});
