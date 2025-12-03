import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { products } from './(tabs)/index';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const product = products.find(p => p.id === Number(id));

  if (!product) return <View style={styles.container}><Text>Không tìm thấy sản phẩm</Text></View>;

  return (
    <View style={styles.container}>
      <Image source={product.image} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{product.price.toLocaleString()}₫</Text>
      <Text style={styles.category}>{product.category}</Text>
      <Text style={styles.desc}>{product.description}</Text>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', padding: 24 },
  image: { width: 240, height: 240, borderRadius: 16, marginBottom: 24 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  price: { fontSize: 20, color: '#e91e63', fontWeight: '600', marginBottom: 8 },
  category: { fontSize: 16, color: '#888', marginBottom: 8 },
  desc: { fontSize: 16, color: '#333', marginBottom: 24, textAlign: 'center' },
  backBtn: { padding: 12, backgroundColor: '#e91e63', borderRadius: 8 },
  backText: { color: '#fff', fontWeight: '600' },
});
