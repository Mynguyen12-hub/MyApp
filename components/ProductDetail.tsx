import { ArrowLeft, Heart, Minus, Plus, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProductDetailProps {
  product: any;
  onBack: () => void;
  onAddToCart: (product: any, quantity: number) => void;
  onToggleWishlist: (id: number) => void;
  isWishlisted: boolean;
  allProducts?: any[];
  onViewProduct?: (product: any) => void;
  onBuyNow?: (product: any, quantity: number) => void;
}

export default function ProductDetail({
  product,
  onBack,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  allProducts = [],
  onViewProduct,
  onBuyNow,
}: ProductDetailProps) {
  
  const [quantity, setQuantity] = useState(1);
  const [current, setCurrent] = useState<any>(product);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    setCurrent(product);
  }, [product]);

  useEffect(() => {
    const buildRelated = async () => {
      try {
        const categoryKey = current?.category_ref ?? current?.category_id;

        console.log('ProductDetail: buildRelated start', { current, categoryKey, allProductsCount: allProducts?.length });

        if (allProducts && allProducts.length > 0) {
          const list = allProducts.filter((p: any) => {
            if (!categoryKey) return false;
            if (typeof categoryKey === 'number') return p.category_id === categoryKey;
            return (p.category_ref === categoryKey) || (String(p.category_id) === String(categoryKey));
          }).filter((p:any) => p.id !== current.id);
          console.log('ProductDetail: related from allProducts', { count: list.length, sample: list.slice(0,3) });
          setRelated(list);
          return;
        }

        const res = await fetch(
          `https://firestore.googleapis.com/v1/projects/flower-30f60/databases/(default)/documents/products?key=AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4`
        );
        const json = await res.json();
        const list = (json.documents || []).map((doc: any) => {
          const f = doc.fields || {};
          return {
            id: Number(f.id?.integerValue || f.id?.stringValue || 0),
            name: f.name?.stringValue || "",
            price: Number(f.price?.integerValue || f.price?.stringValue || 0),
            image_url: f.image_url?.stringValue || f['image_url ']?.stringValue || "",
            category_id: f.category_id?.integerValue ? Number(f.category_id.integerValue) : (f.category_id?.stringValue || null),
            category_ref: f.category_id?.stringValue || null,
            docId: doc.name ? String(doc.name).split('/').pop() : undefined,
          };
        }).filter((p:any) => {
          if (!categoryKey) return false;
          if (typeof categoryKey === 'number') return p.category_id === categoryKey;
          return (p.category_ref === categoryKey) || (String(p.category_id) === String(categoryKey));
        }).filter((p:any) => p.id !== current.id);

        console.log('ProductDetail: related from fetch', { count: list.length, sample: list.slice(0,3) });
        setRelated(list);
      } catch (e) {
        console.error('Error building related products', e);
        setRelated([]);
      }
    };

    buildRelated();
  }, [current, allProducts]);

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
        <Image source={{ uri: current?.image_url || current?.image }} style={styles.image} resizeMode="cover" />

        {/* Info */}
        <View style={{ padding: 16 }}>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.row}>
            <Star size={16} color="#facc15" />
            <Text style={styles.rating}>4.9 · 120 reviews</Text>
          </View>

          <Text style={styles.price}>{product.price.toLocaleString()}₫</Text>

          <Text style={styles.desc}>
            {current?.description || current?.desc || 'Hoa tươi mới, được tuyển chọn kỹ càng. Phù hợp cho mọi dịp đặc biệt.'}
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

      {/* Related products */}
      {related.length > 0 && (
        <View style={{ padding: 12, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Sản phẩm liên quan</Text>
          <FlatList
            data={related}
            horizontal
            keyExtractor={(item) => (item.docId ?? item.id).toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => onViewProduct ? onViewProduct(item) : setCurrent(item)} style={{ width: 140, marginRight: 12 }}>
                <Image source={{ uri: item.image_url }} style={{ width: 140, height: 100, borderRadius: 8 }} />
                <Text numberOfLines={2} style={{ marginTop: 6 }}>{item.name}</Text>
                <Text style={{ color: '#e11d48', fontWeight: '700' }}>₫ {(item.price ?? 0).toLocaleString()}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Add to Cart + Buy Now */}
      <View style={styles.bottomBar}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={[styles.cartBtn, { flex: 1 }]}
            onPress={() => {
              onAddToCart(current, quantity);
              onBack();
            }}
          >
            <Text style={styles.cartText}>
              Thêm vào giỏ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.buyNowBtn, { flex: 1 }]}
            onPress={() => onBuyNow ? onBuyNow(current, quantity) : null}
          >
            <Text style={styles.buyNowText}>
              Mua ngay
            </Text>
          </TouchableOpacity>
        </View>
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
  buyNowBtn: { backgroundColor: '#fff', padding: 16, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderColor: '#e11d48' },
  buyNowText: { color: '#e11d48', fontSize: 16, fontWeight: '600' },
});
