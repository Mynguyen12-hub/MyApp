import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { searchProducts } from "../utils/firebaseAPI";
let ImagePicker: any;
try {
  // require at runtime to avoid build-time type errors if package isn't installed
  ImagePicker = require('expo-image-picker');
} catch (e) {
  ImagePicker = null;
}

interface Props {
  navigation: { goBack: () => void };
  products?: any[];
  onPressProduct?: (product: any) => void;
}

interface Product {
  id: string;
  name: string;
  price: number | string;
  image?: string;
  image_url?: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export default function SearchScreen({ navigation, products = SAMPLE_PRODUCTS, onPressProduct }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [useFirebase, setUseFirebase] = useState(false); // Toggle Firebase vs local search
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Load history
  useEffect(() => {
    loadHistory();
  }, []);

  // Log results for debugging
  useEffect(() => {
    if (results.length > 0) {
      console.log(`📊 [SearchScreen] Results:`, results);
      results.forEach(item => {
        console.log(`  ✅ ${item.name}: ${item.image}`);
      });
    }
  }, [results]);

  const loadHistory = async () => {
    const stored = await AsyncStorage.getItem("search_history");
    if (stored) setHistory(JSON.parse(stored));
  };

  const saveHistory = async (text: string) => {
    let newHistory = [text, ...history.filter((item) => item !== text)];
    newHistory = newHistory.slice(0, 5); // chỉ giữ 5 cái

    setHistory(newHistory);
    await AsyncStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  // Search products from Firebase via backend API
  const searchFirebase = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      console.log(`🔍 Searching Firebase for: ${searchQuery}`);

      const data = await searchProducts({ query: searchQuery });

      console.log(`✅ Firebase Search Response:`, data);

      if (data.success) {
        setResults(data.products || []);
        saveHistory(searchQuery);
        
        if (data.products?.length === 0) {
          Alert.alert("Thông báo", `Không tìm thấy sản phẩm "${searchQuery}"`);
        }
      } else {
        Alert.alert("Lỗi", data.message || "Lỗi tìm kiếm từ Firebase");
      }
    } catch (error: any) {
      console.error("❌ Firebase search error:", error);
      Alert.alert(
        "Lỗi kết nối",
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra URL backend hoặc sử dụng tìm kiếm cục bộ.",
        [
          {
            text: "Dùng tìm kiếm cục bộ",
            onPress: () => {
              setUseFirebase(false);
              performLocalSearch(searchQuery);
            }
          },
          { text: "OK", onPress: () => {} }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Local search (fallback)
  const performLocalSearch = (searchText: string) => {
    const q = searchText.trim();
    if (!q) return setResults([]);

    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(q.toLowerCase())
    );

    setResults(filtered);
    saveHistory(q);
  };

  // perform a search when user submits
  const performSearch = (text?: string) => {
    const q = (typeof text === 'string' ? text : query).trim();
    setQuery(q);

    if (useFirebase) {
      searchFirebase(q);
    } else {
      performLocalSearch(q);
    }
  };

  const deleteHistoryItem = async (item: string) => {
    const newHistory = history.filter((h) => h !== item);
    setHistory(newHistory);
    await AsyncStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  // Tìm kiếm bằng hình
const pickImage = async () => {
  if (!ImagePicker) return;

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (perm.status !== 'granted') return;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    base64: true, // ⭐ QUAN TRỌNG
  });

  if (!result.canceled && result.assets?.[0]) {
    const imageBase64 = result.assets[0].base64;
    searchByImage(imageBase64);
  }
};
const searchByImage = async (base64: string) => {
  try {
    setLoading(true);

    const res = await fetch("http://YOUR_BACKEND/image-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64 }),
    });

    const data = await res.json();

    if (data.keyword) {
      setQuery(data.keyword);
      performSearch(data.keyword);
    } else {
      Alert.alert("Không nhận diện được hình ảnh");
    }
  } catch (e) {
    Alert.alert("Lỗi tìm kiếm bằng hình ảnh");
  } finally {
    setLoading(false);
  }
};

  const openCamera = async () => {
    if (!ImagePicker) {
      Alert.alert('Package missing', 'Please install expo-image-picker to use camera search');
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission required', 'Allow camera access to take photo for search');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    const asset = result?.assets?.[0] || (result as any).uri ? (result as any) : null;
    if (asset) {
      const detectedText = 'hoa';
      setQuery(detectedText);
      performSearch(detectedText);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} />
        </TouchableOpacity>

        <Text style={styles.title}>Tìm kiếm</Text>

        {/* Firebase Toggle Button */}
        <TouchableOpacity 
          style={[styles.firebaseBtn, { backgroundColor: useFirebase ? '#e91e63' : '#ccc' }]}
          onPress={() => setUseFirebase(!useFirebase)}
        >
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Tìm sản phẩm..."
          value={query}
          onChangeText={(t) => setQuery(t)}
          onSubmitEditing={() => performSearch()}
          returnKeyType="search"
          editable={!loading}
        />

        {loading && <ActivityIndicator size="small" color="#e91e63" style={{ marginRight: 10 }} />}

        <TouchableOpacity onPress={pickImage} disabled={loading}>
          <Ionicons name="image" size={26} color={loading ? "#ccc" : "#666"} />
        </TouchableOpacity>

        <TouchableOpacity onPress={openCamera} style={{ marginLeft: 10 }} disabled={loading}>
          <Ionicons name="camera" size={26} color={loading ? "#ccc" : "#666"} />
        </TouchableOpacity>
      </View>

      {/* HISTORY */}
      {history.length > 0 && (
        <View style={styles.historyBox}>
          <Text style={styles.historyTitle}>Lịch sử tìm kiếm</Text>
          {history.map((item, idx) => (
            <View key={idx} style={styles.historyItem}>
              <TouchableOpacity style={styles.historyLeft} onPress={() => performSearch(item)}>
                <Ionicons name="time-outline" size={18} color="#888" />
                <Text style={styles.historyText}>{item}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteHistoryItem(item)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color="#e91e63" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* RESULTS */}
      {results.length > 0 ? (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Kết quả tìm kiếm ({results.length})</Text>
        </View>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id?.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 0 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onPressProduct?.(item)}
            activeOpacity={0.8}
            style={styles.productCard}
          >
            <View style={styles.productImageContainer}>
              {(() => {
                const img = item.image_url ?? item.image;
                if (img && !failedImages.has(item.id)) {
                  if (typeof img === "number") {
                    return (
                      <Image
                        source={img}
                        style={styles.productImage}
                        onLoad={() => console.log(`✅ Image loaded: ${item.name}`)}
                        onError={(err) => {
                          console.error(`❌ Image failed to load: ${item.name}`, err);
                          setFailedImages(new Set([...failedImages, item.id]));
                        }}
                      />
                    );
                  } else if (typeof img === "string" && img.startsWith("http")) {
                    return (
                      <Image
                        source={{ uri: img } as const}
                        style={styles.productImage}
                        onLoad={() => console.log(`✅ Image loaded: ${item.name}`)}
                        onError={(err) => {
                          console.error(`❌ Image failed to load: ${item.name} (${img})`, err);
                          setFailedImages(new Set([...failedImages, item.id]));
                        }}
                      />
                    );
                  }
                }
                return (
                  <View style={[styles.productImage, styles.placeholderImage]}>
                    <Ionicons name="image-outline" size={50} color="#ddd" />
                    <Text style={styles.placeholderText}>Không có ảnh</Text>
                  </View>
                );
              })()}
            </View>
            
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.productDescription} numberOfLines={1}>
                {item.description || "Sản phẩm chất lượng"}
              </Text>
              <Text style={styles.productPrice}>
                {typeof item.price === "number"
                  ? item.price.toLocaleString("vi-VN")
                  : item.price}
                {" đ"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                Không tìm thấy sản phẩm "{query}"
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={results.length === 0 ? { flex: 1 } : {}}
      />
    </View>
  );
}

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: "Hoa Hồng Đỏ",
    price: "150.000",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=80",
  },
  {
    id: 2,
    name: "Hoa Tulip",
    price: "200.000",
    image:
      "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=500&q=80",
  },
];

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12, justifyContent: "space-between" },
  title: { fontSize: 20, fontWeight: "bold", flex: 1, marginLeft: 10 },
  firebaseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#ccc",
  },
  firebaseBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    marginTop: 20,
  },
  input: { flex: 1, fontSize: 16 },
  historyBox: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    paddingVertical: 6,
  },
  historyTitle: { fontWeight: "bold", marginBottom: 8 },
  historyItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 4, 
    justifyContent: "space-between" 
  },
  historyLeft: { 
    flexDirection: "row", 
    alignItems: "center", 
    flex: 1 
  },
  historyText: { 
    marginLeft: 8, 
    fontSize: 16, 
    flexShrink: 1 
  },
  deleteBtn: { paddingLeft: 12 },

  // Results Styles
  resultsHeader: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 10,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  // Product Card Grid
  productCard: {
    flex: 1,
    marginHorizontal: 6,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  productInfo: {
    padding: 12,
    backgroundColor: "#fff",
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    height: 36,
  },
  productDescription: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
    fontStyle: "italic",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e91e63",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    textAlign: "center",
  },
});
