import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Product } from "./index";

interface CartItem {
  id: number;
  quantity: number;
}

interface ProductsPageProps {
  products: Product[];
  favorites: number[];
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (id: number) => void;
  onPressImage?: (product: Product) => void;
  cartItems?: CartItem[];
  onOpenCart?: () => void;
}

export function ProductsPage({
  products,
  favorites,
  onAddToCart,
  onToggleFavorite,
  onPressImage,
  cartItems = [],
  onOpenCart,
}: ProductsPageProps) {
  const windowWidth = useWindowDimensions().width;
  const [selectedCategory, setSelectedCategory] = useState("Tất Cả");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["Tất Cả", "Hoa Hồng", "Hoa Tulip", "Hoa Hướng Dương", "Hoa Lavender"];
  const categoryIcons = ["list", "gift", "calendar", "heart", "star"];
  const categoryLabels = ["Tất Cả", "Birthday", "Event", "Wedding", "For You"];

  // Tính tổng sản phẩm trong giỏ
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Lọc sản phẩm theo category và search query
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === "Tất Cả" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <View style={{ flex: 1 }}>
      {/* SEARCH BAR + CART ICON */}
<View style={styles.searchContainer}>
  <View style={styles.searchBoxWrapper}>
    <View style={styles.searchBox}>
      <Image source={require('../../assets/images/sreach.jpg')} style={styles.searchIcon} />
      <TextInput
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ flex: 1, fontSize: 16, color: "#333" }}
        placeholderTextColor="#ccc"
      />
    </View>
    <TouchableOpacity onPress={onOpenCart} style={{ marginLeft: 12, position: 'relative' }}>
      <Ionicons name="cart-outline" size={28} color="#333" />
      {cartItems.length > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cartItems.length}</Text>
        </View>
      )}
    </TouchableOpacity>
  </View>
</View>

      {/* CATEGORY BUTTONS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 12, marginVertical: 10 }}>
        {categories.map((cat, idx) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Ionicons
              name={categoryIcons[idx] as any}
              size={24}
              color={selectedCategory === cat ? "#fff" : "#e91e63"}
            />
            <Text style={{
              marginTop: 4,
              fontSize: 11,
              fontWeight: '500',
              color: selectedCategory === cat ? "#fff" : "#333",
              textAlign: "center"
            }}>
              {categoryLabels[idx]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* PRODUCTS GRID */}
      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 12 }}
        contentContainerStyle={{ paddingBottom: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.productWrapper, { marginHorizontal: 4 }]}>
      <TouchableOpacity onPress={() => onPressImage?.(item)} activeOpacity={0.7}>
        <Image source={item.image} style={styles.productImage} resizeMode="cover" />
      </TouchableOpacity>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>₫ {item.price.toLocaleString()}</Text>
          <TouchableOpacity onPress={() => onToggleFavorite(item.id)} style={styles.heartButton}>
            <Ionicons
              name={favorites.includes(item.id) ? "heart" : "heart-outline"}
              size={16}
              color={favorites.includes(item.id) ? "#e91e63" : "#ccc"}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => onAddToCart(item)}
          style={styles.addToCartButton}
        >
          <Ionicons name="cart" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.addToCartText}>Thêm</Text>
        </TouchableOpacity>
      </View>
    </View>
  )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
searchContainer: { 
  padding: 12, 
  paddingTop: 30, // kéo xuống thấp hơn
  backgroundColor: "#fff",
},
searchBoxWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,    // khoảng cách phía trên thanh tìm kiếm
},
searchBox: { 
  flex: 1,
  flexDirection: "row", 
  alignItems: "center", 
  backgroundColor: "#fff", 
  padding: 8, 
  borderRadius: 12, 
  borderWidth: 1.5, 
  borderColor: "#ffe4ed" 
},
searchIcon: { 
  width: 32, 
  height: 32, 
  borderRadius: 8, 
  marginRight: 8 
},
badge: {
  position: "absolute",
  top: -5,
  right: -10,
  backgroundColor: "#e91e63",
  width: 20,
  height: 20,
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center",
},
badgeText: { 
  color: "#fff", 
  fontSize: 10, 
  fontWeight: "600" 
},
  categoryButton: {
    width: 60,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#ffe4ed",
    marginRight: 8,
    paddingVertical: 6,
  },
  categoryButtonActive: {
    backgroundColor: "#e91e63",
    borderColor: "#e91e63",
  },
  productWrapper: { flex: 1, marginVertical: 8, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 2 },
  productImage: { width: "100%", height: 160, backgroundColor: "#f5f5f5" },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 },
  productFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productPrice: { fontSize: 14, fontWeight: "700", color: "#e91e63" },
  heartButton: { padding: 6 },
  addToCartButton: { backgroundColor: "#e91e63", borderRadius: 8, paddingVertical: 8, flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8 },
  addToCartText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
