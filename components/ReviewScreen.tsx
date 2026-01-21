import Ionicons from "@expo/vector-icons/Ionicons";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { app } from "../config/firebaseConfig";

export default function ReviewScreen({ route, navigation }: any) {
  const { orderId, items } = route.params;
  const [reviews, setReviews] = useState<any>({});

  const setRating = (productId: string, rating: number) => {
    setReviews((prev: any) => ({
      ...prev,
      [productId]: { ...prev[productId], rating },
    }));
  };

  const setComment = (productId: string, text: string) => {
    setReviews((prev: any) => ({
      ...prev,
      [productId]: { ...prev[productId], comment: text },
    }));
  };

  const submitReview = async () => {
    const db = getFirestore(app);

    await updateDoc(doc(db, "orders", orderId), {
      isReviewed: true,
      reviews,
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đánh giá sản phẩm</Text>

      <FlatList
        data={items}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>

            <View style={{ flexDirection: "row", marginVertical: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(item.id, star)}
                >
                  <Ionicons
                    name={
                      reviews[item.id]?.rating >= star
                        ? "star"
                        : "star-outline"
                    }
                    size={28}
                    color="#facc15"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Nhận xét sản phẩm..."
              style={styles.input}
              multiline
              onChangeText={(t) => setComment(item.id, t)}
            />
          </View>
        )}
      />

      <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          Gửi đánh giá
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  name: { fontWeight: "600", fontSize: 16 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  submitBtn: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 12,
  },
});
