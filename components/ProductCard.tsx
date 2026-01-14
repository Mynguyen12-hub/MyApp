import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Product } from "../app/(tabs)/index";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: number) => void;
  onPressImage?: () => void;
}

export function ProductCard({
  product,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  onPressImage,
}: ProductCardProps) {
  return (
    <View style={styles.card}>
      {/* Nút yêu thích */}
      <TouchableOpacity
        style={styles.favoriteBtn}
        onPress={() => onToggleFavorite(product.id)}
      >
        {isFavorite ? (
          <Feather name="heart" size={20} color="#e91e63" />
        ) : (
          <Feather name="heart" size={20} color="#777" />
        )}
      </TouchableOpacity>

      {/* Hình ảnh - click để xem chi tiết */}
      <TouchableOpacity onPress={onPressImage}>
        <Image 
          source={
            typeof product.image_url === 'string' && product.image_url.startsWith('http')
              ? { uri: product.image_url }
              : typeof product.image_url === 'string'
              ? { uri: `http://localhost:3000/${product.image_url}` }
              : { uri: 'https://via.placeholder.com/200' }
          } 
          style={styles.image} 
          resizeMode="cover" 
        />
      </TouchableOpacity>

      {/* Thông tin */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.price}>{product.price.toLocaleString()}₫</Text>

        {/* Nút thêm vào giỏ */}
        <TouchableOpacity
          onPress={() => onAddToCart(product)}
          style={styles.addBtn}
        >
          <Feather name="shopping-cart" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Thêm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    top:30,
  },
  image: {
    width: "100%",
    height: 120,
  },
  info: {
    padding: 8,
  },
  name: {
    fontWeight: "500",
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontWeight: "600",
    fontSize: 14,
    color: "#e91e63",
    marginBottom: 8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e91e63",
    paddingVertical: 6,
    borderRadius: 12,
    justifyContent: "center",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 12,
  },
  favoriteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 12,
    elevation: 2,
  },
});
