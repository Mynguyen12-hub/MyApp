import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { collection, getFirestore, onSnapshot, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
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
import { app } from "../../config/firebaseConfig";

import { MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from "@expo/vector-icons/Ionicons";
import { CartDrawer } from "../../components/CartDrawer";
import ProductDetail from '../../components/ProductDetail';
import { ProductsPage } from "./ProductsPage";
// import { OrdersPage } from "./OrdersPage";
import ChatScreen from "../../components/ChatScreen";
import { Checkout } from "../../components/Checkout";
import SearchScreen from "../../components/SearchScreen";
import { DEFAULT_ADDRESSES } from '../../data/addressData';
import { useAuth } from "../context/AuthContext";
import { FavoritesPage } from "./FavoritesPage";
import { ProfilePage } from "./ProfilePage";


export interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_id: number;
  category_ref?: string | null;
  description?: string;
  stock?: number;
  discountPrice: number;
  promotion: boolean;
  created_at?: string;
}



export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
}



export default function HomeScreen() {
  // ===== ALL HOOKS AT THE TOP =====
  const { logout, user } = useAuth();
  const windowWidth = useWindowDimensions().width;
const [selectedCategory, setSelectedCategory] =
  useState<number | string | "ALL">("ALL");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
    // Load cart from AsyncStorage khi đăng nhập hoặc app khởi động
    useEffect(() => {
      const loadCart = async () => {
        try {
          const saved = await AsyncStorage.getItem('CART_ITEMS');
          if (saved) setCartItems(JSON.parse(saved));
        } catch (e) { console.log('Load cart error', e); }
      };
      loadCart();
}, [user?.uid]);

    // Lưu cart vào AsyncStorage khi cartItems thay đổi
    useEffect(() => {
      AsyncStorage.setItem('CART_ITEMS', JSON.stringify(cartItems));
    }, [cartItems]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [favorites, setFavorites] = useState<number[]>([]);

  // Load favorites from AsyncStorage khi đăng nhập hoặc app khởi động
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const saved = await AsyncStorage.getItem('FAVORITES');
        if (saved) setFavorites(JSON.parse(saved));
      } catch (e) { console.log('Load favorites error', e); }
    };
    loadFavorites();
}, [user?.uid]);

  // Lưu favorites vào AsyncStorage khi favorites thay đổi
  useEffect(() => {
    AsyncStorage.setItem('FAVORITES', JSON.stringify(favorites));
  }, [favorites]);
const [orders, setOrders] = useState<Order[]>([]);
  // Fetch orders from Firestore for current user
useEffect(() => {
  if (!user?.uid) {
    setOrders([]);
    return;
  }

  const db = getFirestore(app);
  const q = query(
    collection(db, "orders"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const unsub = onSnapshot(q, (snap) => {
    const list = snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        date: d.createdAt?.toDate?.().toLocaleString() ?? "",
        items: d.items ?? [],
        total: d.total ?? 0,
        status: d.status ?? "pending",
        note: d.note ?? "",
      };
    });

    setOrders(list);
  });

  return unsub;
}, [user?.uid]);
  // Fetch orders when user logs in or HomeScreen mounts
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[] | null>(null);
  const [checkoutSelectedDiscount, setCheckoutSelectedDiscount] = useState<number>(0);
  const [checkoutFreeShipping, setCheckoutFreeShipping] = useState<boolean>(false);
  const [checkoutDeliveryFee, setCheckoutDeliveryFee] = useState<number>(16500);
  const [checkoutFinalTotal, setCheckoutFinalTotal] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerRef = useRef<FlatList>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [openProfileNotifications, setOpenProfileNotifications] = useState(false);
  const [profileIncomingNotification, setProfileIncomingNotification] = useState<null | any>(null);
  
  const navigation = useNavigation();
//goi api 
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const getFirestoreNumber = (field: any): number | null => {
  if (!field) return null;
  if (field.integerValue !== undefined) return Number(field.integerValue);
  if (field.doubleValue !== undefined) return Number(field.doubleValue);
  if (field.stringValue !== undefined && !isNaN(Number(field.stringValue))) {
    return Number(field.stringValue);
  }
  return null;
};

//---------------------------------------------------
  // Address and Payment Methods state
  const [addresses, setAddresses] = useState(DEFAULT_ADDRESSES);

  const [paymentMethods] = useState([
    { id: 'cod', type: 'cod' as const, label: 'Thanh toán khi nhận hàng', isDefault: true },
    { id: 'momo', type: 'momo' as const, label: 'Ví MoMo' },
    { id: 'vnpay', type: 'vnpay' as const, label: 'VNPay (Thẻ ATM/Banking)' },
    { id: 'bank', type: 'bank' as const, label: 'Chuyển khoản ngân hàng' },
  ]);

  // Saved vouchers state
const [savedVouchers, setSavedVouchers] = useState<Voucher[]>([]);
type Voucher = {
  id: string;
  code: string;
  type: "percent" | "freeship";
  discountValue: number;
  minPrice?: number;
  maxDiscount?: number;
};

const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);

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
  selectedCategory === "ALL" || (typeof selectedCategory === 'number' ? p.category_id === selectedCategory : p.category_ref === selectedCategory);
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });
interface Category {
  id: number; // numeric id if present
  docId?: string; // Firestore document id string
  name: string;
}
useEffect(() => {
  fetchCategories();
}, []);

const fetchCategories = async () => {
  try {
    const res = await fetch(
      "https://firestore.googleapis.com/v1/projects/flower-30f60/databases/(default)/documents/categories?key=AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4"
    );

    const json = await res.json();

    const list: Category[] = json.documents.map((doc: any) => ({
      // Firestore may store numbers as integerValue or stringValue depending on how they were written.
      id: doc.fields.id?.integerValue
        ? Number(doc.fields.id.integerValue)
        : doc.fields.id?.stringValue
        ? Number(doc.fields.id.stringValue)
        : NaN,
      // extract Firestore document id from doc.name: .../documents/categories/<docId>
      docId: doc.name ? String(doc.name).split('/').pop() : undefined,
      name: doc.fields.name?.stringValue || doc.fields.name || "",
    }));

    console.log('Fetched raw categories JSON:', json);
    console.log('Parsed categories list:', list);
    setCategories(list);
  } catch (e) {
    console.log("Fetch categories error:", e);
  }
};

const [categories, setCategories] = useState<Category[]>([]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const exist = prev.find((item) => item.id === product.id);
      if (exist) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...product, quantity }];
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
    const orderItems: CartItem[] = info?.items && info.items.length ? info.items : [...cartItems];
    const orderTotal: number =
      typeof info?.finalTotal === 'number'
        ? info.finalTotal
        : orderItems.reduce((s, i) => s + i.price * i.quantity, 0) + 50000;

    const newOrder: Order = {
      id: `ORD${Date.now()}`,
      date: new Date().toISOString(),
      items: orderItems,
      total: orderTotal,
      status: "pending",
    };
    setOrders((prev) => [newOrder, ...prev]);
    // Chỉ xóa các sản phẩm đã mua khỏi giỏ hàng
    const purchasedIds = orderItems.map(i => i.id);
    const remainingCartItems = cartItems.filter(item => !purchasedIds.includes(item.id));
    setCartItems(remainingCartItems);
    AsyncStorage.setItem('CART_ITEMS', JSON.stringify(remainingCartItems));
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    // clear checkout temporary states
    setCheckoutItems(null);
    setCheckoutSelectedDiscount(0);
    setCheckoutFreeShipping(false);
    setCheckoutDeliveryFee(16500);
    setCheckoutFinalTotal(null);
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
//goi api ------------
  useEffect(() => {
    fetchProducts();
    fetchVouchers();
  }, []);

const fetchVouchers = async () => {
  try {
    const key = 'AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4';
    const url = `https://firestore.googleapis.com/v1/projects/flower-30f60/databases/(default)/documents/vouchers?key=${key}`;
    const res = await fetch(url);
    const json = await res.json();

    const docs = json.documents || [];

    const voucherList = docs.map((doc: any, idx: number) => {
      const f = doc.fields || {};

      const type = f.type?.stringValue === "freeship" ? "freeship" : "percent";

      const discountValue =
        f.discountValue?.integerValue
          ? Number(f.discountValue.integerValue)
          : f.discountValue?.stringValue
          ? Number(f.discountValue.stringValue)
          : 0;

      return {
        id: doc.name?.split("/").pop() || `v${idx}`,
        code: f.code?.stringValue || "",
        type,
        discountValue,
        minPrice: f.minPrice?.integerValue
          ? Number(f.minPrice.integerValue)
          : undefined,
        maxDiscount: f.maxDiscount?.integerValue
          ? Number(f.maxDiscount.integerValue)
          : undefined,
      };
    });

    console.log("Vouchers parsed:", voucherList);
    setAllVouchers(voucherList);
  } catch (e) {
    console.log("Fetch vouchers error:", e);
  }
};

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        "https://firestore.googleapis.com/v1/projects/flower-30f60/databases/(default)/documents/products?key=AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4"
      );
      const json = await res.json();

      const list: Product[] = json.documents.map((doc: any) => {
        const f = doc.fields;
        return {
          id: Number(f.id?.integerValue || f.id?.stringValue || 0),
          name: f.name?.stringValue || "",
          price: Number(f.price?.integerValue || f.price?.stringValue || 0),
          image_url: (f.image_url?.stringValue || f['image_url ']?.stringValue || "") as string,
          category_id: f.category_id?.integerValue
            ? Number(f.category_id.integerValue)
            : f.category_id?.stringValue && !isNaN(Number(f.category_id.stringValue))
            ? Number(f.category_id.stringValue)
            : NaN,
          category_ref: f.category_id?.stringValue || null,
          description: (f.description?.stringValue || f['description ']?.stringValue) as string,
          stock: f.stock?.stringValue,
          discountPrice: Number(f.discountPrice?.integerValue || f.discountPrice?.stringValue || 0),
          promotion: f.promotion?.booleanValue || false,
          created_at: f.created_at?.stringValue || new Date().toISOString(),
        } as any;
      });

      setProducts(list);
    } catch (e) {
      console.log("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };



//----------------------------------------------------
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
            allProducts={products}
            onViewProduct={(p) => setSelectedProduct(p)}
            onBuyNow={(product, quantity) => {
              addToCart(product, quantity);
              setSelectedProduct(null);
              setIsCheckoutOpen(true);
            }}
            canReview={!!orders.find(o => o.status === 'delivered' && o.items.some(it => it.id === selectedProduct.id))}
          />
        )}
      </Modal>

      {!selectedProduct && (
        <>
          {/* ================= HOME TAB ================= */}
          {activeTab === "home" && (
            
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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

          {/* ===== VOUCHER SECTION ===== */}
<View style={{ paddingHorizontal: 12, marginTop: 20, marginBottom: 12 }}>
  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 12 }}>
    🎫 Mã Giảm Giá
  </Text>

  <FlatList
    data={allVouchers}
    horizontal
    showsHorizontalScrollIndicator={false}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => {
      const isSaved = savedVouchers.some(v => v.id === item.id);

      return (
        <TouchableOpacity
          style={{
            backgroundColor: isSaved ? '#f5e4e8' : '#ffe4ed',
            borderRadius: 12,
            padding: 12,
            marginRight: 12,
            borderLeftWidth: 4,
            borderLeftColor: '#e91e63',
            minWidth: 180,
            opacity: isSaved ? 0.6 : 1,
          }}
          activeOpacity={0.8}
          onPress={() => {
            setSavedVouchers(prev =>
              isSaved
                ? prev.filter(v => v.id !== item.id)
                : [...prev, item]
            );
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>

              {/* 🔥 TÊN MÃ GIẢM GIÁ */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#e91e63',
                  marginBottom: 4,
                }}
              >
                {item.code}
              </Text>

              {/* 🔻 NỘI DUNG GIẢM */}
              <Text style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>
                {item.type === 'percent'
                  ? `Giảm ${item.discountValue}%`
                  : `Giảm ${item.discountValue.toLocaleString()}đ phí ship`}
              </Text>

              {/* 🔻 ĐƠN TỐI THIỂU */}
              {item.minPrice && (
                <Text style={{ fontSize: 11, color: '#666' }}>
                  Đơn tối thiểu {item.minPrice.toLocaleString()}đ
                </Text>
              )}

              {/* 🔻 GIẢM TỐI ĐA */}
              {item.type === 'percent' && item.maxDiscount && (
                <Text style={{ fontSize: 11, color: '#666' }}>
                  Giảm tối đa {item.maxDiscount.toLocaleString()}đ
                </Text>
              )}
            </View>

            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={20}
              color="#e91e63"
            />
          </View>
        </TouchableOpacity>
      );
    }}
  />
</View>

          {/* ===== HOT PRODUCTS - HORIZONTAL SCROLL ===== */}
          <View style={{ marginTop: 20, marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 12, paddingHorizontal: 12 }}>🔥 Sản Phẩm Bán Chạy</Text>
            <FlatList
              data={products.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `hot-${item.id}`}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              renderItem={({ item }) => {
                const discountPercent = item.discountPrice > 0 && item.discountPrice < item.price && item.price > 0 ? Math.round(((item.price - item.discountPrice) / item.price) * 100) : 0;
                return (
                  <View style={{ marginRight: 12, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2, width: 140 }}>
                    <TouchableOpacity 
                      activeOpacity={0.7}
                      onPress={() => setSelectedProduct(item)}
                      style={{ position: 'relative' }}
                    >
                      <Image
                        source={{ uri: item.image_url }}
                        style={{ width: 140, height: 140, backgroundColor: '#f5f5f5' }}
                        resizeMode="cover"
                      />
                      <TouchableOpacity 
                        onPress={() => toggleFavorite(item.id)}
                        style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#fff', padding: 4, borderRadius: 16 }}
                      >
                        <Ionicons
                          name={favorites.includes(item.id) ? "heart" : "heart-outline"}
                          size={18}
                          color={favorites.includes(item.id) ? "#e91e63" : "#ccc"}
                        />
                      </TouchableOpacity>
                      {discountPercent > 0 && (
                        <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#e91e63', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>-{discountPercent}%</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <View style={{ padding: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#333', marginBottom: 4 }} numberOfLines={2}>{item.name}</Text>
                      <View style={{ marginBottom: 6 }}>
                        {item.discountPrice > 0 && item.discountPrice < item.price ? (
                          <>
                            <Text style={{ fontSize: 10, color: '#999', textDecorationLine: 'line-through' }}>₫ {Number(item.price || 0).toLocaleString()}</Text>
                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#e91e63' }}>₫ {Number(item.discountPrice || 0).toLocaleString()}</Text>
                          </>
                        ) : (
                          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#e91e63' }}>₫ {Number(item.price || 0).toLocaleString()}</Text>
                        )}
                      </View>
                      <TouchableOpacity 
                        onPress={() => addToCart(item)}
                        style={{ backgroundColor: '#e91e63', borderRadius: 6, padding: 6, alignItems: 'center' }}
                      >
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Thêm vào giỏ</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          </View>

          {/* PROMOTION PRODUCTS - HORIZONTAL SCROLL */}
          <View style={{ marginTop: 20, marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 12, paddingHorizontal: 12 }}>🎉 Sản Phẩm Khuyến Mãi</Text>
            <FlatList
              data={products.filter(p => p.promotion).slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `promo-${item.id}`}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              renderItem={({ item }) => {
                const discountPercent = item.discountPrice > 0 && item.discountPrice < item.price && item.price > 0 ? Math.round(((item.price - item.discountPrice) / item.price) * 100) : 0;
                return (
                  <View style={{ marginRight: 12, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2, width: 140 }}>
                    <TouchableOpacity 
                      activeOpacity={0.7}
                      onPress={() => setSelectedProduct(item)}
                      style={{ position: 'relative' }}
                    >
                      <Image
                        source={{ uri: item.image_url }}
                        style={{ width: 140, height: 140, backgroundColor: '#f5f5f5' }}
                        resizeMode="cover"
                      />
                      <TouchableOpacity 
                        onPress={() => toggleFavorite(item.id)}
                        style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#fff', padding: 4, borderRadius: 16 }}
                      >
                        <Ionicons
                          name={favorites.includes(item.id) ? "heart" : "heart-outline"}
                          size={18}
                          color={favorites.includes(item.id) ? "#e91e63" : "#ccc"}
                        />
                      </TouchableOpacity>
                      {discountPercent > 0 && (
                        <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#e91e63', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>-{discountPercent}%</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <View style={{ padding: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#333', marginBottom: 4 }} numberOfLines={2}>{item.name}</Text>
                      <View style={{ marginBottom: 6 }}>
                        {item.discountPrice > 0 && item.discountPrice < item.price ? (
                          <>
                            <Text style={{ fontSize: 10, color: '#999', textDecorationLine: 'line-through' }}>₫ {Number(item.price || 0).toLocaleString()}</Text>
                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#e91e63' }}>₫ {Number(item.discountPrice || 0).toLocaleString()}</Text>
                          </>
                        ) : (
                          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#e91e63' }}>₫ {Number(item.price || 0).toLocaleString()}</Text>
                        )}
                      </View>
                      <TouchableOpacity 
                        onPress={() => addToCart(item)}
                        style={{ backgroundColor: '#e91e63', borderRadius: 6, padding: 6, alignItems: 'center' }}
                      >
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Thêm vào giỏ</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          </View>

          {/* NEW PRODUCTS - HORIZONTAL SCROLL sorted by created_at */}
          <View style={{ marginTop: 20, marginBottom: 100 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 12, paddingHorizontal: 12 }}>🆕 Sản Phẩm Mới</Text>
            <FlatList
              data={[...products].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `new-${item.id}`}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              renderItem={({ item }) => {
                const discountPercent = item.discountPrice > 0 && item.discountPrice < item.price && item.price > 0 ? Math.round(((item.price - item.discountPrice) / item.price) * 100) : 0;
                return (
                  <View style={{ marginRight: 12, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2, width: 140 }}>
                    <TouchableOpacity 
                      activeOpacity={0.7}
                      onPress={() => setSelectedProduct(item)}
                      style={{ position: 'relative' }}
                    >
                      <Image
                        source={{ uri: item.image_url }}
                        style={{ width: 140, height: 140, backgroundColor: '#f5f5f5' }}
                        resizeMode="cover"
                      />
                      <TouchableOpacity 
                        onPress={() => toggleFavorite(item.id)}
                        style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#fff', padding: 4, borderRadius: 16 }}
                      >
                        <Ionicons
                          name={favorites.includes(item.id) ? "heart" : "heart-outline"}
                          size={18}
                          color={favorites.includes(item.id) ? "#e91e63" : "#ccc"}
                        />
                      </TouchableOpacity>
                      {discountPercent > 0 && (
                        <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#e91e63', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>-{discountPercent}%</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <View style={{ padding: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#333', marginBottom: 4 }} numberOfLines={2}>{item.name}</Text>
                      <View style={{ marginBottom: 6 }}>
                        {item.discountPrice > 0 && item.discountPrice < item.price ? (
                          <>
                            <Text style={{ fontSize: 10, color: '#999', textDecorationLine: 'line-through' }}>₫ {Number(item.price || 0).toLocaleString()}</Text>
                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#e91e63' }}>₫ {Number(item.discountPrice || 0).toLocaleString()}</Text>
                          </>
                        ) : (
                          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#e91e63' }}>₫ {Number(item.price || 0).toLocaleString()}</Text>
                        )}
                      </View>
                      <TouchableOpacity 
                        onPress={() => addToCart(item)}
                        style={{ backgroundColor: '#e91e63', borderRadius: 6, padding: 6, alignItems: 'center' }}
                      >
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Thêm vào giỏ</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </ScrollView>
      )}

      {/* ========== OTHER PAGES ========== */}
{activeTab === "categories" && (
  <ProductsPage
    products={products}
    categories={categories}
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
          onPressCart={() => setIsCartOpen(true)}
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
        onCheckout={(payload) => {
          // payload: { items, discountAmount, freeShipping, deliveryFee, finalTotal }
          setCheckoutItems(payload.items);
          setCheckoutSelectedDiscount(payload.discountAmount || 0);
          setCheckoutFreeShipping(!!payload.freeShipping);
          setCheckoutDeliveryFee(payload.deliveryFee || 0);
          setCheckoutFinalTotal(payload.finalTotal ?? null);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Global Chat Modal (moved out of home view so it works from any tab) */}
      <Modal visible={isChatOpen} animationType="slide">
        <View style={{ flex: 1 }}>
          <View style={{ height: 60, backgroundColor: "#f8f8f8", justifyContent: "center", paddingLeft: 16, borderBottomWidth: 1, borderBottomColor: "#ddd" }}>
            <TouchableOpacity onPress={() => setIsChatOpen(false)} style={{ marginTop: 10 }}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ChatScreen onAddToCart={addToCart} />
        </View>
      </Modal>

      {/* CHECKOUT - Full screen modal */}
      <Modal
        visible={isCheckoutOpen}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <Checkout
          items={(checkoutItems ?? cartItems).map(item => ({ ...item, id: String(item.id) }))}
          addresses={addresses}
          paymentMethods={paymentMethods}
          selectedDiscount={checkoutSelectedDiscount}
          freeShipping={checkoutFreeShipping}
          onBack={() => {
            setIsCheckoutOpen(false);
            setIsCartOpen(true);
          }}
          onPlaceOrder={(address, payment, discount) => {
            // Chỉ xóa sản phẩm đã mua khỏi giỏ hàng khi đặt hàng từ trang home
            handleCheckout({
              items: checkoutItems ?? cartItems,
              address,
              payment,
              discount,
              finalTotal: checkoutFinalTotal
            });
          }}
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
    marginTop: 8,
    elevation: 4,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
