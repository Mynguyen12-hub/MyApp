import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

/**
 * Test Image Display Component
 * Dùng để test xem ảnh có hiển thị được không
 */

export default function ImageTestScreen() {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const testImages = [
    {
      id: "rose",
      name: "Hoa Hồng Đỏ",
      url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=80",
    },
    {
      id: "tulip",
      name: "Hoa Tulip",
      url: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=500&q=80",
    },
    {
      id: "sunflower",
      name: "Hoa Hướng Dương",
      url: "https://images.unsplash.com/photo-1597848212624-e2d27ba5653f?w=500&q=80",
    },
    {
      id: "invalid",
      name: "Ảnh Không Hợp Lệ (để test placeholder)",
      url: "https://invalid-url-that-does-not-exist.com/image.jpg",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🖼️ Test Hiển Thị Ảnh</Text>
        <Text style={styles.subtitle}>Kiểm tra xem ảnh có tải được không</Text>
      </View>

      {testImages.map((item) => (
        <View key={item.id} style={styles.testCard}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.urlText}>{item.url}</Text>

          <View style={styles.imageContainer}>
            {!failedImages.has(item.id) ? (
              <Image
                source={{ uri: item.url }}
                style={styles.testImage}
                onError={() => {
                  console.log(`❌ Failed to load image: ${item.id}`);
                  setFailedImages(new Set([...failedImages, item.id]));
                }}
                onLoad={() => console.log(`✅ Image loaded: ${item.id}`)}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={50} color="#ddd" />
                <Text style={styles.placeholderText}>Ảnh không tải được</Text>
              </View>
            )}
          </View>

          <Text style={styles.status}>
            {failedImages.has(item.id) ? "❌ Lỗi" : "✅ Thành công"}
          </Text>
        </View>
      ))}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 Tips:</Text>
        <Text style={styles.infoText}>
          • Mở React Native Debugger để xem console logs{"\n"}
          • Nếu ảnh không tải → kiểm tra URL{"\n"}
          • Nếu ảnh tải được → Component SearchScreen sẽ hoạt động{"\n"}
          • Kiểm tra kết nối mạng (WiFi/4G)
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
  },
  testCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  urlText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
    fontFamily: "monospace",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  testImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#1565c0",
    lineHeight: 20,
  },
});
