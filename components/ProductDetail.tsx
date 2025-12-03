import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { ArrowLeft, Heart, Minus, Plus, Star } from 'lucide-react-native';

interface ProductDetailProps {
  product: any;
  onBack: () => void;
  onAddToCart: (product: any, quantity: number) => void;
  onToggleWishlist: (id: number) => void;
  isWishlisted: boolean;
}

export default function ProductDetail({
  product,
  onBack,
  onAddToCart,
  isWishlisted,
  onToggleWishlist
}: ProductDetailProps) {
  
  const [quantity, setQuantity] = useState(1);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <ArrowLeft color="#e11d48" size={22} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onToggleWishlist(product.id)} style={styles.iconBtn}>
          <Heart
            size={22}
            color={isWishlisted ? "red" : "#e11d48"}
            fill={isWishlisted ? "red" : "none"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Image */}
        <Image source={product.image} style={styles.image} resizeMode="cover" />

        {/* Info */}
        <View style={{ padding: 16 }}>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.row}>
            <Star size={16} color="#facc15" />
            <Text style={styles.rating}>4.9 · 120 reviews</Text>
          </View>

          <Text style={styles.price}>{product.price.toLocaleString()}₫</Text>

          <Text style={styles.desc}>
            Hoa tươi mới, được tuyển chọn kỹ càng. Phù hợp cho mọi dịp đặc biệt.
          </Text>

          {/* Quantity */}
          <Text style={styles.qtyLabel}>Số lượng</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
              <Minus size={20} color="#e11d48" />
            </TouchableOpacity>

            <Text style={styles.qtyText}>{quantity}</Text>

            <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qtyBtn}>
              <Plus size={20} color="#e11d48" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartBtn}
          onPress={() => onAddToCart(product, quantity)}
        >
          <Text style={styles.cartText}>
            Thêm vào giỏ – {(product.price * quantity).toLocaleString()}₫
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, paddingTop: 30, },
  iconBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 30, elevation: 3 },
  image: { width: '100%', height: 300, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  name: { fontSize: 28, fontWeight: '600', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  rating: { marginLeft: 6, color: '#666' },
  price: { fontSize: 26, color: '#e11d48', fontWeight: '700', marginVertical: 10 },
  desc: { color: '#444', lineHeight: 20, marginBottom: 20 },
  qtyLabel: { marginBottom: 8, fontSize: 16, fontWeight: '500' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  qtyBtn: { padding: 10, backgroundColor: '#fce7f3', borderRadius: 10 },
  qtyText: { fontSize: 20, fontWeight: '600' },
  bottomBar: { padding: 16, borderTopWidth: 1, borderColor: '#eee' },
  cartBtn: { backgroundColor: '#e11d48', padding: 16, borderRadius: 14, alignItems: 'center' },
  cartText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
