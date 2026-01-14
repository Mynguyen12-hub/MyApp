import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Product {
  id: string | number;
  name: string;
  price: number;
  image_url?: string;
  image?: any;
  category?: string;
  description: string;
  rating?: number;
  reviews?: number;
}

export default function ProductDetail() {
  const router = useRouter();
  const { product: productData } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  let product: Product | null = null;
  try {
    if (productData && typeof productData === 'string') {
      // Decode URI encoded string to JSON
      const decoded = decodeURIComponent(productData);
      product = JSON.parse(decoded);
      console.log("Product loaded:", product);
    }
  } catch (error) {
    console.error("Error parsing product:", error, "Raw data:", productData);
  }

  const handleAddToCart = () => {
    console.log("Added to cart:", product?.name, "Quantity:", quantity);
    // TODO: Implement add to cart logic with context/Redux
    alert(`Đã thêm "${product?.name}" vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    console.log("Buy now:", product?.name);
    // TODO: Navigate to checkout
    router.push('/checkout');
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.header}>
          <Ionicons name="arrow-back" size={24} color="#e91e63" />
        </TouchableOpacity>
        <Text>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#e91e63" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color="#e91e63" 
          />
        </TouchableOpacity>
      </View>

      {/* Product Image */}
      {product.image_url && (
        <Image source={{ uri: product.image_url }} style={styles.image} />
      )}

      {/* Product Info */}
      <View style={styles.infoSection}>
        <Text style={styles.name}>{product.name}</Text>
        
        {/* Rating */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>
            {product.rating || 4.9} · {product.reviews || 120} đánh giá
          </Text>
        </View>

        {/* Price */}
        <Text style={styles.price}>
          {typeof product.price === 'number' ? product.price.toLocaleString('vi-VN') : product.price}
          <Text style={{ fontSize: 14 }}>₫</Text>
        </Text>

        {/* Description */}
        {product.description && (
          <Text style={styles.desc}>{product.description}</Text>
        )}
      </View>

      {/* Related Products Section (optional) */}
      <View style={styles.relatedSection}>
        <Text style={styles.sectionTitle}>Sản phẩm liên quan</Text>
        <View style={styles.relatedProducts}>
          <View style={styles.relatedCard}>
            <View style={styles.relatedImage} />
            <Text style={styles.relatedName}>Sản phẩm tương tự</Text>
            <Text style={styles.relatedPrice}>₫ 980.000</Text>
          </View>
          <View style={styles.relatedCard}>
            <View style={styles.relatedImage} />
            <Text style={styles.relatedName}>Sản phẩm tương tự</Text>
            <Text style={styles.relatedPrice}>₫ 900.000</Text>
          </View>
          <View style={styles.relatedCard}>
            <View style={styles.relatedImage} />
            <Text style={styles.relatedName}>Sản phẩm tương tự</Text>
            <Text style={styles.relatedPrice}>₫ 999.000</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.buyNowBtn}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  image: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 16,
  },
  desc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  relatedSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  relatedProducts: {
    flexDirection: 'row',
    gap: 12,
  },
  relatedCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  relatedImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#e0e0e0',
  },
  relatedName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    padding: 8,
    textAlign: 'center',
  },
  relatedPrice: {
    fontSize: 12,
    color: '#e91e63',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#e91e63',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buyNowBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e91e63',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowText: {
    color: '#e91e63',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
