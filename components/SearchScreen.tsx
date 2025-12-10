import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  StatusBar,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
let ImagePicker: any;
try {
  // require at runtime to avoid build-time type errors if package isn't installed
  ImagePicker = require('expo-image-picker');
} catch (e) {
  ImagePicker = null;
}
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
  navigation: { goBack: () => void };
  products?: any[];
  onPressProduct?: (product: any) => void;
}

export default function SearchScreen({ navigation, products = SAMPLE_PRODUCTS, onPressProduct }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  // Load history
  useEffect(() => {
    loadHistory();
  }, []);

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

  // perform a search when user submits (not on every keystroke)
  const performSearch = (text?: string) => {
    const q = (typeof text === 'string' ? text : query).trim();
    setQuery(q);
    if (!q) return setResults([]);

    // simple name-filter search
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(q.toLowerCase())
    );

    setResults(filtered);
    saveHistory(q);
  };

  const deleteHistoryItem = async (item: string) => {
    const newHistory = history.filter((h) => h !== item);
    setHistory(newHistory);
    await AsyncStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  // Tìm kiếm bằng hình
  const pickImage = async () => {
    if (!ImagePicker) {
      Alert.alert('Package missing', 'Please install expo-image-picker to use image search');
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to photos to use image search');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    const asset = result?.assets?.[0] || (result as any).uri ? (result as any) : null;
    if (asset) {
      // TODO: replace with real OCR/vision detection
      const detectedText = 'hoa';
      setQuery(detectedText);
      performSearch(detectedText);
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
        />

        <TouchableOpacity onPress={pickImage}>
          <Ionicons name="image" size={26} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity onPress={openCamera} style={{ marginLeft: 10 }}>
          <Ionicons name="camera" size={26} color="#666" />
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
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onPressProduct?.(item)}
            activeOpacity={0.7}
            style={styles.resultItem}
          >
            {typeof item.image === 'number' ? (
              <Image source={item.image} style={styles.resultImg} />
            ) : (
              <Image source={{ uri: item.image }} style={styles.resultImg} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultPrice}>{item.price} đ</Text>
            </View>
          </TouchableOpacity>
        )}
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
  container: { flex: 1, padding: 16, paddingTop: 50, backgroundColor: "#fff" ,},
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "bold", marginLeft: 10 },
searchRow: {
  flexDirection: "row",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical:12,  // <-- đã lớn nhưng vẫn có thể tăng nữa
  marginBottom: 12,
  marginTop: 20, 
  
},
  input: { flex: 1, fontSize: 16 },
  historyBox: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    paddingVertical: 6

  },
  historyTitle: { fontWeight: "bold", marginBottom: 8 },
  historyItem: { flexDirection: "row", alignItems: "center", paddingVertical: 4, justifyContent: 'space-between' },
  historyLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  historyText: { marginLeft: 8, fontSize: 16, flexShrink: 1 },
  deleteBtn: { paddingLeft: 12 },
  resultItem: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  resultImg: { width: 60, height: 60, marginRight: 10, borderRadius: 8 },
  resultName: { fontSize: 16, fontWeight: "bold" },
  resultPrice: { color: "#e91e63", marginTop: 4 },
});
