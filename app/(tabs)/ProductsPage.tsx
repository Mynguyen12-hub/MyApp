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
  const [sortMode, setSortMode] = useState<'default' | 'price_asc' | 'price_desc' | 'rating_desc' | 'alpha_asc' | 'alpha_desc'>('default');
  const [showSearch, setShowSearch] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const categoryIcons = ["list", "gift", "calendar", "heart", "star"];

  // Tính tổng sản phẩm trong giỏ
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Lọc sản phẩm theo category và search query
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === "ALL" ||
      (typeof selectedCategory === 'number' ? p.category_id === selectedCategory : p.category_ref === selectedCategory);
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Sắp xếp theo sortMode
  const sortedProducts = React.useMemo(() => {
    const list = [...filteredProducts];
    if (sortMode === 'price_asc') return list.sort((a,b) => (Number(a.price)||0) - (Number(b.price)||0));
    if (sortMode === 'price_desc') return list.sort((a,b) => (Number(b.price)||0) - (Number(a.price)||0));
    if (sortMode === 'rating_desc') return list.sort((a,b) => (Number(b.rating)||0) - (Number(a.rating)||0));
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

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ marginRight: 8, color: '#666' }}>Sắp xếp:</Text>
          <TouchableOpacity onPress={() => setShowSortModal(true)} style={[styles.sortBtn, { paddingHorizontal: 12 }]}
          >
            <Text style={[styles.sortText, sortMode === 'default' && styles.sortTextActive]}>{
              sortMode === 'default' ? 'Mặc định' :
              sortMode === 'price_asc' ? 'Giá: Thấp → Cao' :
              sortMode === 'price_desc' ? 'Giá: Cao → Thấp' :
              sortMode === 'rating_desc' ? 'Theo sao ↓' :
              sortMode === 'alpha_asc' ? 'A → Z' : 'Z → A'
            }</Text>
          </TouchableOpacity>
        </View>

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
        renderItem={({ item }) => (
          <View style={[styles.productWrapper, { marginHorizontal: 4 }]}>
      <TouchableOpacity onPress={() => onPressImage?.(item)} activeOpacity={0.7}>
<Image
  source={{ uri: item.image_url }}
  style={styles.productImage}
  resizeMode="cover"
/>
      </TouchableOpacity>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.productFooter}>
<Text style={styles.productPrice}>
  ₫ {(item.price ?? 0).toLocaleString()}
</Text>
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
      {/* Sort modal */}
      <Modal visible={showSortModal} transparent animationType="fade" onRequestClose={() => setShowSortModal(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} activeOpacity={1} onPress={() => setShowSortModal(false)}>
          <View style={{ position: 'absolute', top: 140, right: 12, left: 12, backgroundColor: '#fff', borderRadius: 10, padding: 12 }}>
            {[
              { key: 'default', label: 'Mặc định' },
              { key: 'price_asc', label: 'Giá: Thấp → Cao' },
              { key: 'price_desc', label: 'Giá: Cao → Thấp' },
              { key: 'rating_desc', label: 'Theo sao ↓' },
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
