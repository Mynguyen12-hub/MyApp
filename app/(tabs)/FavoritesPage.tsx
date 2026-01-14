import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"; // bông hoa
import React, { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ProductCard } from "../../components/ProductCard";
import type { Product } from "./index";

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
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortMode, setSortMode] = useState<"default" | "price_asc" | "price_desc" | "alpha_asc" | "alpha_desc">("default");
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);

  // Filter and sort logic
  const filteredFavorites = favorites
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const price = Number(p.price) || 0;
      const matchPrice = price >= minPrice && price <= maxPrice;
      return matchSearch && matchPrice;
    })
    .sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      switch (sortMode) {
        case "price_asc":
          return priceA - priceB;
        case "price_desc":
          return priceB - priceA;
        case "alpha_asc":
          return a.name.localeCompare(b.name);
        case "alpha_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

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

      {/* Filter Header */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 35, gap: 8, alignItems: 'center' }}>
        <TouchableOpacity onPress={() => setShowSortModal(true)} style={{ paddingHorizontal: 8 }}>
          <Ionicons name="swap-vertical" size={20} color="#e91e63" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowPriceFilter(true)} style={{ paddingHorizontal: 8 }}>
          <Ionicons name="cash-outline" size={20} color="#e91e63" />
        </TouchableOpacity>
      </View>

      {filteredFavorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
          <Text style={styles.emptySubText}>Thử thay đổi bộ lọc</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFavorites}
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
      )}

      {/* Sort modal */}
      <Modal visible={showSortModal} transparent animationType="fade" onRequestClose={() => setShowSortModal(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} activeOpacity={1} onPress={() => setShowSortModal(false)}>
          <View style={{ position: 'absolute', top: 140, right: 12, left: 12, backgroundColor: '#fff', borderRadius: 10, padding: 12 }}>
            {[
              { key: 'default', label: 'Mặc định' },
              { key: 'price_asc', label: 'Giá: Thấp → Cao' },
              { key: 'price_desc', label: 'Giá: Cao → Thấp' },
              { key: 'alpha_asc', label: 'A → Z' },
              { key: 'alpha_desc', label: 'Z → A' },
            ].map((opt) => (
              <TouchableOpacity key={opt.key} onPress={() => { setSortMode(opt.key as any); setShowSortModal(false); }} style={{ paddingVertical: 10 }}>
                <Text style={{ fontSize: 16 }}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Price Filter Modal */}
      <Modal visible={showPriceFilter} transparent animationType="slide" onRequestClose={() => setShowPriceFilter(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700' }}>Lọc theo giá</Text>
              <TouchableOpacity onPress={() => setShowPriceFilter(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Price Range Display */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Khoảng giá:</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginRight: 8 }}>
                  <Text style={{ fontSize: 12, color: '#999' }}>Tối thiểu</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#e91e63' }}>₫ {minPrice.toLocaleString()}</Text>
                </View>
                <Text style={{ color: '#999' }}>—</Text>
                <View style={{ flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginLeft: 8 }}>
                  <Text style={{ fontSize: 12, color: '#999' }}>Tối đa</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#e91e63' }}>₫ {maxPrice.toLocaleString()}</Text>
                </View>
              </View>
            </View>

            {/* Quick Filter Presets */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>Giá phổ biến:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: 'Dưới 100K', min: 0, max: 100000 },
                  { label: '100K - 500K', min: 100000, max: 500000 },
                  { label: '500K - 1M', min: 500000, max: 1000000 },
                  { label: 'Trên 1M', min: 1000000, max: 999999999 },
                ].map((preset) => (
                  <TouchableOpacity 
                    key={preset.label}
                    onPress={() => { setMinPrice(preset.min); setMaxPrice(preset.max); }}
                    style={{ 
                      paddingVertical: 8, 
                      paddingHorizontal: 12, 
                      borderRadius: 20, 
                      borderWidth: 1.5,
                      borderColor: minPrice === preset.min && maxPrice === preset.max ? '#e91e63' : '#ddd',
                      backgroundColor: minPrice === preset.min && maxPrice === preset.max ? '#ffe4ed' : '#fff'
                    }}
                  >
                    <Text style={{ 
                      fontSize: 12, 
                      color: minPrice === preset.min && maxPrice === preset.max ? '#e91e63' : '#666',
                      fontWeight: minPrice === preset.min && maxPrice === preset.max ? '600' : '400'
                    }}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Price Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Nhập giá tùy chỉnh:</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Từ</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 8 }}>
                    <Text style={{ color: '#666', marginRight: 4 }}>₫</Text>
                    <TouchableOpacity onPress={() => setMinPrice(Math.max(0, minPrice - 10000))} style={{ padding: 4 }}>
                      <Ionicons name="chevron-down" size={16} color="#e91e63" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', flex: 1, textAlign: 'center' }}>
                      {(minPrice / 1000).toFixed(0)}K
                    </Text>
                    <TouchableOpacity onPress={() => setMinPrice(Math.min(maxPrice - 10000, minPrice + 10000))} style={{ padding: 4 }}>
                      <Ionicons name="chevron-up" size={16} color="#e91e63" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Đến</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 8 }}>
                    <Text style={{ color: '#666', marginRight: 4 }}>₫</Text>
                    <TouchableOpacity onPress={() => setMaxPrice(Math.max(minPrice + 10000, maxPrice - 10000))} style={{ padding: 4 }}>
                      <Ionicons name="chevron-down" size={16} color="#e91e63" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', flex: 1, textAlign: 'center' }}>
                      {(maxPrice / 1000).toFixed(0)}K
                    </Text>
                    <TouchableOpacity onPress={() => setMaxPrice(maxPrice + 10000)} style={{ padding: 4 }}>
                      <Ionicons name="chevron-up" size={16} color="#e91e63" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                onPress={() => { setMinPrice(0); setMaxPrice(1000000); }}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#e91e63' }}
              >
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#e91e63' }}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowPriceFilter(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#e91e63' }}
              >
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#fff' }}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
