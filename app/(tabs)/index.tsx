import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from '@react-navigation/native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from "@expo/vector-icons/Ionicons";
import { ProductCard } from '../../components/ProductCard';
import ProductDetail from '../../components/ProductDetail';
import { CartDrawer } from "../../components/CartDrawer";
import { ProductsPage } from "./ProductsPage";
// import { OrdersPage } from "./OrdersPage";
import { FavoritesPage } from "./FavoritesPage";
import { ProfilePage } from "./ProfilePage";
import { Checkout } from "../../components/Checkout";
import { ImageSourcePropType } from "react-native";
import { useAuth } from "../context/AuthContext";
import ChatScreen from "../../components/ChatScreen";
import SearchScreen from "../../components/SearchScreen";
import { DEFAULT_ADDRESSES } from '../../data/addressData';
export interface Product {
  id: number;
  name: string;
  price: number;
  image: ImageSourcePropType;
  category: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "delivered" | "cancelled";
}

const products: Product[] = [
  {
    id: 1,
    name: "Bó Hoa Hồng",
    price: 450000,
    image: require('../../assets/images/hoahong.jpg'),
    category: "Hoa Hồng",
    description: "Bó hoa hồng tươi đẹp cho mọi dịp",
  },
  {
    id: 2,
    name: "Hoa Tulip Trắng",
    price: 320000,
    image: require('../../assets/images/hoatulip.jpg'),
    category: "Hoa Tulip",
    description: "Hoa tulip trắng thanh lịch",
  },
  {
    id: 3,
    name: "Hoa Hướng Dương",
    price: 380000,
    image: require('../../assets/images/hoahuongduong.jpg'),
    category: "Hoa Hướng Dương",
    description: "Hoa hướng dương rực rỡ",
  },
  {
    id: 4,
    name: "Hoa Lavender",
    price: 290000,
    image: require('../../assets/images/hoalavender.jpg'),
    category: "Hoa Lavender",
    description: "Hoa lavender thơm dịu nhẹ",
  },
];

const categories = [
  "Tất Cả",
  "Hoa Hồng",
  "Hoa Tulip",
  "Hoa Hướng Dương",
  "Hoa Lavender",
];

export default function HomeScreen() {
  // ===== ALL HOOKS AT THE TOP =====
  const { logout, user } = useAuth();
  const windowWidth = useWindowDimensions().width;
  const [selectedCategory, setSelectedCategory] = useState("Tất Cả");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerRef = useRef<FlatList>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [openProfileNotifications, setOpenProfileNotifications] = useState(false);
  const [profileIncomingNotification, setProfileIncomingNotification] = useState<null | any>(null);
  const navigation = useNavigation();

  // Address and Payment Methods state
  const [addresses, setAddresses] = useState(DEFAULT_ADDRESSES);

  const [paymentMethods] = useState([
    { id: 'cod', type: 'cod' as const, label: 'Thanh toán khi nhận hàng', isDefault: true },
    { id: 'momo', type: 'momo' as const, label: 'Ví MoMo' },
    { id: 'bank', type: 'bank' as const, label: 'Chuyển khoản ngân hàng' },
  ]);

  // Banner images (3-4 ảnh)
  const bannerImages = [
    { id: 1, image: require('../../assets/images/baner1.jpg') },
    { id: 2, image: require('../../assets/images/banner2.jpg') },
    { id: 3, image: require('../../assets/images/banner3.jpg') },
    { id: 4, image: require('../../assets/images/banner4.jpg') },
  ];

  // ===== ALL LOGIC AFTER HOOKS =====

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === "Tất Cả" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const exist = prev.find((item) => item.id === product.id);
      if (exist) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }
  };

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCheckout = (info: any) => {
    const newOrder: Order = {
      id: `ORD${Date.now()}`,
      date: new Date().toISOString(),
      items: [...cartItems],
      total: totalPrice + 50000,
      status: "pending",
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setActiveTab("orders");
    // create a notification for the new order and send to ProfilePage
    const notif = {
      id: `N${Date.now()}`,
      type: 'order',
      title: `Đơn hàng ${newOrder.id} đã được tạo`,
      message: `Đơn hàng ${newOrder.id} của bạn đã được tạo thành công.`,
      time: 'Vừa xong',
      read: false,
    };
    setProfileIncomingNotification(notif);
  };
useEffect(() => {
  const interval = setInterval(() => {
    if (bannerImages.length > 0 && bannerRef.current) {
      const nextIndex = (bannerIndex + 1) % bannerImages.length;
      bannerRef.current.scrollToIndex({ index: nextIndex, animated: true });
      setBannerIndex(nextIndex);
    }
  }, 3000); // 3 giây chuyển banner
  return () => clearInterval(interval);
}, [bannerIndex, bannerImages.length]);

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      {/* ================= PRODUCT DETAIL MODAL ================= */}
      <Modal
        visible={!!selectedProduct}
        animationType="slide"
        transparent={false}
      >
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
            isWishlisted={favorites.includes(selectedProduct.id)}
            onToggleWishlist={() => toggleFavorite(selectedProduct.id)}
          />
        )}
      </Modal>

      {!selectedProduct && (
        <>
          {/* ================= HOME TAB ================= */}
          {activeTab === "home" && (
            
        <View style={{ flex: 1 }}>
          {/* HEADER WITH BANNER */}
          <View style={styles.headerBanner}>
            {/* Header Top (kept minimal) */}
            <View style={styles.header} />

            {/* Search + Banner */}
            <View style={styles.searchBannerContainer}>
              {/* LOGO + TÊN */}
              <View style={styles.headerLogo}>
<MaterialCommunityIcons name="flower-tulip" size={28} color="#e91e63" style={{ marginRight: 8 }} />         
       <Text style={styles.logoText}>SFlower Phálett</Text>
              </View>             
<View style={styles.searchRow}>
  {/* Search */}
    <TouchableOpacity
      onPress={() => setShowSearch(true)}
      activeOpacity={0.85}
      style={{ flex: 1 }}
    >
      <View style={styles.searchBoxInline}>
        <Image
          source={require('../../assets/images/sreach.jpg')}
          style={styles.smallBouquet}
          resizeMode="cover"
        />
        <Text style={{ flex: 1, fontSize: 16, color: "#999" }}>
          Tìm sản phẩm...
        </Text>
      </View>
    </TouchableOpacity>

  {/* Icon Giỏ Hàng */}
  <TouchableOpacity
    onPress={() => setIsCartOpen(true)}
    style={{ marginLeft: 12, position: "relative" }}
  >
    <Ionicons name="cart-outline" size={28} color="#333" />
    {totalItems > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{totalItems}</Text>
      </View>
    )}
  </TouchableOpacity>

  {/* Icon Chat */}
  <TouchableOpacity
    onPress={() => setIsChatOpen(true)}
    style={{ marginLeft: 12 }}
  >
    <Ionicons name="chatbubble-ellipses-outline" size={28} color="#333" />
  </TouchableOpacity>
</View>
  

    {/* Modal Search (full screen) */}
    <Modal visible={showSearch} animationType="slide">
      <View style={{ flex: 1 }}>
        <SearchScreen
          navigation={{ goBack: () => setShowSearch(false) } as any}
          products={products}
          onPressProduct={(product) => {
            setShowSearch(false);
            setSelectedProduct(product);
          }}
        />
      </View>
    </Modal>

            {/* MAP DISPLAY - CAROUSEL BANNER */}
            <View style={styles.mapDisplayContainer}>
        <FlatList
          ref={bannerRef}
          data={bannerImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          onMomentumScrollEnd={(event) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x;
            const currentIndex = Math.round(contentOffsetX / windowWidth);
            setBannerIndex(currentIndex);
          }}
          renderItem={({ item }) => (
            <Image
              source={item.image}
              style={{
                width: windowWidth - 32,
                height: 120,
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
          )}
          scrollEventThrottle={16}
          snapToInterval={windowWidth - 32 + 16}
          decelerationRate="fast"
          getItemLayout={(data, index) => ({
            length: windowWidth - 32 + 16,
            offset: (windowWidth - 32 + 16) * index,
            index,
          })}
          onScrollToIndexFailed={() => {
            // Fallback if scroll fails
            console.warn('Banner scroll to index failed');
          }}
        />
              {/* Dots indicator */}
              <View style={styles.dotsContainer}>
                {bannerImages.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      idx === bannerIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
            </View>
          </View>

          {/* CATEGORY BUTTONS */}
          <View style={styles.categoryContainer}>
            {["Tất Cả", "Hoa Hồng", "Hoa Tulip", "Hoa Hướng Dương", "Hoa Lavender"].map((cat, idx) => {
              const icons = ['list', 'gift', 'calendar', 'heart', 'star'];
              const labels = ['Tất Cả', 'Birthday', 'Event', 'Wedding', 'For You'];
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat && styles.categoryButtonActive
                  ]}
                >
                  <Ionicons 
                    name={icons[idx] as any} 
                    size={24} 
                    color={selectedCategory === cat ? "#fff" : "#e91e63"} 
                  />
                  <Text
                    style={{
                      color: selectedCategory === cat ? "#fff" : "#333",
                      fontSize: 11,
                      marginTop: 4,
                      textAlign: 'center',
                      fontWeight: '500',
                    }}
                  >
                    {labels[idx]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* PRODUCTS GRID */}
          <FlatList
            data={filteredProducts}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.productWrapper}>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => setSelectedProduct(item)}
                >
                  <Image 
                    source={item.image} 
                    style={styles.productImage} 
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>
                      ₫ {item.price.toLocaleString()}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(item.id)}
                      style={styles.heartButton}
                    >
                      <Ionicons
                        name={favorites.includes(item.id) ? "heart" : "heart-outline"}
                        size={16}
                        color={favorites.includes(item.id) ? "#e91e63" : "#ccc"}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => addToCart(item)}
                    style={styles.addToCartButton}
                  >
                    <Ionicons name="cart" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.addToCartText}>Thêm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={{ padding: 12 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
          />
        </View>
      )}

      {/* ========== OTHER PAGES ========== */}
{activeTab === "categories" && (
  <ProductsPage
    products={products}
    onAddToCart={addToCart}
    favorites={favorites}
    onToggleFavorite={toggleFavorite}
    onPressImage={setSelectedProduct}
    cartItems={cartItems}
    onOpenCart={() => setIsCartOpen(true)}
  />
)}

      {activeTab === "favorites" && (
        <FavoritesPage
          favorites={favoriteProducts}
          onAddToCart={addToCart}
          onToggleFavorite={toggleFavorite}
          onPressImage={setSelectedProduct}
        />
      )}

      {activeTab === "profile" && <ProfilePage
        onOrdersClick={() => setActiveTab("orders")}
        onWishlistClick={() => setActiveTab("favorites")}
        onPaymentsClick={() => setActiveTab("payments")}
        onNotificationsClick={() => setActiveTab("notifications")}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        orderCount={orders.length}
        wishlistCount={favorites.length}
        unreadCount={3}
        onLogout={logout}
        user={user}
        addresses={addresses}
        onAddressesChange={setAddresses}
        orders={orders}
        openNotifications={openProfileNotifications}
        onNotificationsHandled={() => setOpenProfileNotifications(false)}
        incomingNotification={profileIncomingNotification}
        onIncomingHandled={() => setProfileIncomingNotification(null)}
      />}

      {/* CART DRAWER */}
      <CartDrawer
        visible={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={(id) => updateQuantity(id, 0)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Global Chat Modal (moved out of home view so it works from any tab) */}
      <Modal visible={isChatOpen} animationType="slide">
        <View style={{ flex: 1 }}>
          <ChatScreen onBack={() => setIsChatOpen(false)} />
        </View>
      </Modal>

      {/* CHECKOUT - Full screen modal */}
      <Modal
        visible={isCheckoutOpen}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <Checkout
          items={cartItems.map(item => ({ ...item, id: String(item.id) }))}
          addresses={addresses}
          paymentMethods={paymentMethods}
          onBack={() => {
            setIsCheckoutOpen(false);
            setIsCartOpen(true);
          }}
          onPlaceOrder={(address, payment, discount) => handleCheckout({ address, payment, discount })}
        />
      </Modal>

      {/* ========== BOTTOM NAVIGATION ========== */}
      <View style={styles.bottomNav}>
        {[
          { key: "home", icon: "home-outline" as const, label: "Trang Chủ" },
          { key: "categories", icon: "grid-outline" as const, label: "Sản phẩm" },
          { key: "notifications", icon: "notifications-outline" as const, label: "Thông báo" },
          { key: "favorites", icon: "heart-outline" as const, label: "Yêu Thích" },
          { key: "profile", icon: "person-outline" as const, label: "Tài Khoản" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => {
              // If user taps the Notifications bottom tab, open Profile and show notifications there
              if (tab.key === 'notifications') {
                setActiveTab('profile');
                setOpenProfileNotifications(true);
                return;
              }
              setActiveTab(tab.key);
            }}
            style={styles.navItem}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={activeTab === tab.key ? "#e91e63" : "#777"}
            />
            <Text
              style={{
                fontSize: 12,
                color: activeTab === tab.key ? "#e91e63" : "#777",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fdf6f8",
    alignItems: "center",
    elevation: 0,
  },
  headerBanner: {
    backgroundColor: "#fdf6f8",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  searchBannerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fdf6f8",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ffe4ed",
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchBoxInline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#ffe4ed",
    
  },
  searchInputInline: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    color: '#333'
  },
  smallBouquet: {
    width: 40,
    height: 32,
    borderRadius: 8,
    marginRight: 8,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  banner: {
    backgroundColor: "#fde4ed",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  bannerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e91e63",
    marginBottom: 12,
  },
  mapDisplayContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginTop: 10
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
  },
  dotActive: {
    backgroundColor: "#e91e63",
    width: 24,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryButton: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#ffe4ed",
  },
  categoryButtonActive: {
    backgroundColor: "#e91e63",
    borderColor: "#e91e63",
  },
  productWrapper: {
    flex: 1,
    marginHorizontal: 6,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#f5f5f5",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e91e63",
  },
  heartButton: {
    padding: 6,
  },
  addToCartButton: {
    backgroundColor: "#e91e63",
    borderRadius: 8,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
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
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  bottomNav: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    backgroundColor: "#fff",
  },
  navItem: {
    alignItems: "center",
  },
  headerLogo: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
},

logoText: {
  fontSize: 18,
  fontWeight: "700",
  color: "#e91e63",
},

});
