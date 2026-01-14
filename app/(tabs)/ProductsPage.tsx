import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import SearchScreen from "../../components/SearchScreen";
import type { Product } from "./index";

interface CartItem {
  id: number;
  quantity: number;
}

interface ProductsPageProps {
  products: Product[];
  categories?: { id: number; docId?: string; name: string }[];
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
  categories = [],
}: ProductsPageProps) {
  const windowWidth = useWindowDimensions().width;
  const [selectedCategory, setSelectedCategory] = useState<number | string | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<'default' | 'price_asc' | 'price_desc' | 'alpha_asc' | 'alpha_desc'>('default');
  const [showSearch, setShowSearch] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [showPromotionFilter, setShowPromotionFilter] = useState(false);
  const [showOnlyPromotion, setShowOnlyPromotion] = useState(false);
  const categoryIcons = ["list", "gift", "calendar", "heart", "star"];

  // Tính tổng sản phẩm trong giỏ
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Lọc sản phẩm theo category, search query, giá và khuyến mãi
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === "ALL" ||
      (typeof selectedCategory === 'number' ? p.category_id === selectedCategory : p.category_ref === selectedCategory);
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const price = Number(p.price) || 0;
    const discountPrice = Number(p.discountPrice) || 0;
    const matchPrice = price >= minPrice && price <= maxPrice;
    const hasDiscount = discountPrice > 0 && discountPrice < price;
    const matchPromotion = showOnlyPromotion ? hasDiscount : true;
    return matchCategory && matchSearch && matchPrice && matchPromotion;
  });

  // Sắp xếp theo sortMode
  const sortedProducts = React.useMemo(() => {
    const list = [...filteredProducts];
    if (sortMode === 'price_asc') return list.sort((a,b) => (Number(a.price)||0) - (Number(b.price)||0));
    if (sortMode === 'price_desc') return list.sort((a,b) => (Number(b.price)||0) - (Number(a.price)||0));
    if (sortMode === 'alpha_asc') return list.sort((a,b) => String(a.name).localeCompare(String(b.name)));
    if (sortMode === 'alpha_desc') return list.sort((a,b) => String(b.name).localeCompare(String(a.name)));
    return list;
  }, [filteredProducts, sortMode]);

  const HeaderComponent = () => (
    <View>
      <View style={styles.searchContainer}>
        <View style={styles.searchBoxWrapper}>
          <TouchableOpacity
            onPress={() => setShowSearch(true)}
            activeOpacity={0.85}
            style={{ flex: 1 }}
          >
            <View style={styles.searchBox}>
              <Image source={require('../../assets/images/sreach.jpg')} style={styles.searchIcon} />
              <Text style={{ flex: 1, fontSize: 16, color: "#999" }}>Tìm sản phẩm...</Text>
            </View>
          </TouchableOpacity>
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 12, marginVertical: 10, marginTop: 8 }}>
        <TouchableOpacity
          key="all"
          style={[styles.categoryButton, selectedCategory === "ALL" && styles.categoryButtonActive]}
          onPress={() => setSelectedCategory("ALL")}
        >
          <Ionicons name="list" size={24} color={selectedCategory === "ALL" ? "#fff" : "#e91e63"} />
          <Text style={{ marginTop: 4, fontSize: 11, fontWeight: '500', color: selectedCategory === "ALL" ? "#fff" : "#333", textAlign: "center" }}>Tất Cả</Text>
        </TouchableOpacity>

        {categories.map((cat, idx) => {
          const catKey = cat.docId ?? String(cat.id);
          const isActive = selectedCategory === (cat.docId ?? cat.id);
          const iconName =
            cat.name === "Hoa sinh nhật" ? "gift" :
            cat.name === "Hoa tình yêu" ? "calendar" :
            cat.name === "Hoa cưới" ? "heart" :
            cat.name === "Hoa chúc mừng" ? "star" :
            categoryIcons[idx % categoryIcons.length];

          return (
            <TouchableOpacity
              key={catKey}
              style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(cat.docId ?? cat.id)}
            >
              <Ionicons name={iconName as any} size={24} color={isActive ? "#fff" : "#e91e63"} />
              <Text style={{ marginTop: 4, fontSize: 11, fontWeight: '500', color: isActive ? "#fff" : "#333", textAlign: "center" }}>{cat.name || `ID:${cat.id}`}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8, alignItems: 'center', gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={{ marginRight: 8, color: '#666', fontSize: 12 }}>Sắp xếp:</Text>
          <TouchableOpacity onPress={() => setShowSortModal(true)} style={[styles.sortBtn, { paddingHorizontal: 10 }]}
          >
            <Text style={[styles.sortText, sortMode === 'default' && styles.sortTextActive]} numberOfLines={1}>{
              sortMode === 'default' ? 'Mặc định' :
              sortMode === 'price_asc' ? 'Giá ↑' :
              sortMode === 'price_desc' ? 'Giá ↓' :
              sortMode === 'alpha_asc' ? 'A→Z' : 'Z→A'
            }</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setShowPriceFilter(true)} style={{ padding: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="cash-outline" size={18} color="#e91e63" />
          <Text style={{ fontSize: 12, color: '#e91e63' }}>Giá</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowPromotionFilter(true)} style={{ padding: 8 }}>
          <Ionicons name="pricetag" size={20} color={showOnlyPromotion ? "#e91e63" : "#333"} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowSortModal(true)} style={{ padding: 8 }}>
          <Ionicons name="filter" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    
    <View style={{ flex: 1 }}>
      {/* Modal Search (full screen) */}
      <Modal visible={showSearch} animationType="slide">
        <View style={{ flex: 1 }}>
          <SearchScreen
            navigation={{ goBack: () => setShowSearch(false) } as any}
            products={products}
            onPressProduct={(product) => {
              setShowSearch(false);
              onPressImage?.(product);
            }}
          />
        </View>
      </Modal>

      

      {/* PRODUCTS GRID */}
      <FlatList
        data={sortedProducts}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 12 }}
        contentContainerStyle={{ paddingBottom: 12 }}
        ListHeaderComponent={HeaderComponent}
        ListHeaderComponentStyle={{ backgroundColor: '#fff', zIndex: 10 }}
        stickyHeaderIndices={[0]}
        renderItem={({ item }) => {
          const discountPercent = item.discountPrice > 0 && item.discountPrice < item.price && item.price > 0 ? Math.round(((item.price - item.discountPrice) / item.price) * 100) : 0;
          return (
            <View style={[styles.productWrapper, { marginHorizontal: 4 }]}>
              <TouchableOpacity onPress={() => onPressImage?.(item)} activeOpacity={0.7} style={{ position: 'relative' }}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                {discountPercent > 0 && (
                  <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#e91e63', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>-{discountPercent}%</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <View style={{ marginBottom: 6 }}>
                  {item.discountPrice > 0 && item.discountPrice < item.price ? (
                    <>
                      <Text style={{ fontSize: 11, color: '#999', textDecorationLine: 'line-through' }}>₫ {Number(item.price || 0).toLocaleString()}</Text>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#e91e63' }}>₫ {Number(item.discountPrice || 0).toLocaleString()}</Text>
                    </>
                  ) : (
                    <Text style={styles.productPrice}>
                      ₫ {(item.price ?? 0).toLocaleString()}
                    </Text>
                  )}
                </View>
                <View style={styles.productFooter}>
                  <TouchableOpacity onPress={() => onAddToCart(item)} style={{ flex: 1, marginRight: 6 }}>
                    <View style={styles.addToCartButton}>
                      <Ionicons name="cart" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.addToCartText}>Thêm</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onToggleFavorite(item.id)} style={styles.heartButton}>
                    <Ionicons
                      name={favorites.includes(item.id) ? "heart" : "heart-outline"}
                      size={16}
                      color={favorites.includes(item.id) ? "#e91e63" : "#ccc"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
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
                    <Ionicons 
                      name="chevron-down" 
                      size={16} 
                      color="#e91e63" 
                      onPress={() => setMinPrice(Math.max(0, minPrice - 10000))}
                      style={{ padding: 4 }}
                    />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', flex: 1, textAlign: 'center' }}>
                      {(minPrice / 1000).toFixed(0)}K
                    </Text>
                    <Ionicons 
                      name="chevron-up" 
                      size={16} 
                      color="#e91e63" 
                      onPress={() => setMinPrice(Math.min(maxPrice - 10000, minPrice + 10000))}
                      style={{ padding: 4 }}
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Đến</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 8 }}>
                    <Text style={{ color: '#666', marginRight: 4 }}>₫</Text>
                    <Ionicons 
                      name="chevron-down" 
                      size={16} 
                      color="#e91e63" 
                      onPress={() => setMaxPrice(Math.max(minPrice + 10000, maxPrice - 10000))}
                      style={{ padding: 4 }}
                    />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', flex: 1, textAlign: 'center' }}>
                      {(maxPrice / 1000).toFixed(0)}K
                    </Text>
                    <Ionicons 
                      name="chevron-up" 
                      size={16} 
                      color="#e91e63" 
                      onPress={() => setMaxPrice(maxPrice + 10000)}
                      style={{ padding: 4 }}
                    />
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

      {/* Promotion Filter Modal */}
      <Modal
        visible={showPromotionFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPromotionFilter(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 16,
            maxHeight: 300
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#000' }}>Bộ lọc khuyến mãi</Text>
              <TouchableOpacity onPress={() => setShowPromotionFilter(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Filter Options */}
            <View style={{ marginBottom: 20 }}>
              <TouchableOpacity 
                onPress={() => setShowOnlyPromotion(!showOnlyPromotion)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: '#e91e63',
                  backgroundColor: showOnlyPromotion ? '#e91e63' : '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  {showOnlyPromotion && (
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
                  )}
                </View>
                <Text style={{ fontSize: 14, color: '#333' }}>Chỉ hiện sản phẩm khuyến mãi</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 12, color: '#999', marginLeft: 32, marginTop: 4 }}>
                Hiển thị chỉ những sản phẩm có giá khuyến mãi
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                onPress={() => { setShowOnlyPromotion(false); setShowPromotionFilter(false); }}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1.5, borderColor: '#e91e63' }}
              >
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#e91e63' }}>Tắt lọc</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowPromotionFilter(false)}
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
searchContainer: { 
  padding: 12, 
  paddingTop: 35, // kéo xuống thấp hơn
  backgroundColor: "#fff",
},
productImage: {
  width: '100%',
  height: 130,          // 🔥 BẮT BUỘC
  borderRadius: 12,
  backgroundColor: '#f2f2f2',
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
  paddingVertical: 20,
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
    width: 70,
    height: 78,
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
  productPrice: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#e91e63',
},
  productWrapper: { flex: 1, marginVertical: 8, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 2 },
  // productImage: { width: "100%", height: 160, backgroundColor: "#f5f5f5" },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6, minHeight: 40 },
  productFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  // productPrice: { fontSize: 14, fontWeight: "700", color: "#e91e63" },
  heartButton: { padding: 6 },
  addToCartButton: { backgroundColor: "#e91e63", borderRadius: 8, paddingVertical: 8, flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8 },
  addToCartText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  sortBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginRight: 8 },
  sortBtnActive: { backgroundColor: '#e91e63', borderColor: '#e91e63' },
  sortText: { color: '#333', fontSize: 13 },
  sortTextActive: { color: '#fff' },
});
