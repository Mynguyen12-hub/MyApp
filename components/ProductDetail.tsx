import { ArrowLeft, Heart, Minus, Plus, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../app/context/AuthContext';

interface ProductDetailProps {
  product: any;
  onBack: () => void;
  onAddToCart: (product: any, quantity: number) => void;
  onToggleWishlist: (id: number) => void;
  isWishlisted: boolean;
  allProducts?: any[];
  onViewProduct?: (product: any) => void;
  onBuyNow?: (product: any, quantity: number) => void;
  canReview?: boolean;
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
  canReview = false,
}: ProductDetailProps) {
  
  const [quantity, setQuantity] = useState(1);
  const [current, setCurrent] = useState<any>(product);
  const [related, setRelated] = useState<any[]>([]);
  const { user } = useAuth();

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  useEffect(() => {
    setCurrent(product);
  }, [product]);

  useEffect(() => {
    if (!current) return;
    fetchReviews();
  }, [current]);

  const fetchReviews = async () => {
    try {
      const key = 'AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4';
      const url = `https://firestore.googleapis.com/v1/projects/flower-30f60/databases/(default)/documents/reviews?key=${key}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const docs = json.documents || [];
      const list = docs.map((doc: any) => {
        const f = doc.fields || {};
        return {
          id: doc.name?.split('/').pop(),
          productId: f.productId?.integerValue ? Number(f.productId.integerValue) : (f.productId?.stringValue ? Number(f.productId.stringValue) : null),
          rating: f.rating?.integerValue ? Number(f.rating.integerValue) : (f.rating?.stringValue ? Number(f.rating.stringValue) : 0),
          comment: f.comment?.stringValue || '',
          userId: f.userId?.stringValue || null,
          created_at: f.created_at?.timestampValue || null,
        };
      }).filter((r:any) => r.productId === Number(current.id));
      setReviews(list);
      if (list.length) {
        const avg = list.reduce((s:any, r:any) => s + (r.rating || 0), 0) / list.length;
        setAvgRating(Math.round(avg * 10) / 10);
      } else {
        setAvgRating(null);
      }
    } catch (e) {
      console.warn('Fetch reviews failed', e);
    }
  };

  const submitReview = async () => {
    if (!current) return;
    if (!canReview) {
      Alert.alert('Không thể đánh giá', 'Bạn chỉ có thể đánh giá khi đã nhận hàng.');
      return;
    }
    try {
      const key = 'AIzaSyC8BXvyOAje4OON58cXo_n30tUjBiZy9w4';
      const url = `https://firestore.googleapis.com/v1/projects/flower-30f60/databases/(default)/documents/reviews?key=${key}`;
      const body = {
        fields: {
          productId: { integerValue: String(current.id) },
          rating: { integerValue: String(reviewRating) },
          comment: { stringValue: reviewComment },
          userId: { stringValue: user?.email || user?.name || 'guest' },
          created_at: { timestampValue: new Date().toISOString() },
        }
      };
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setReviewModalOpen(false);
      setReviewComment('');
      setReviewRating(5);
      fetchReviews();
    } catch (e) {
      console.error('Submit review failed', e);
      Alert.alert('Lỗi', 'Gửi đánh giá thất bại.');
    }
  };

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
            <Text style={styles.rating}>{avgRating ? `${avgRating} · ${reviews.length} đánh giá` : 'Chưa có đánh giá'}</Text>
            {canReview && (
              <TouchableOpacity onPress={() => setReviewModalOpen(true)} style={{ marginLeft: 12 }}>
                <Text style={{ color: '#e11d48', fontWeight: '600' }}>Viết đánh giá</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.price}>{product.price.toLocaleString()}₫</Text>

          <Text style={styles.desc}>
            {current?.description || current?.desc || 'Hoa tươi mới, được tuyển chọn kỹ càng. Phù hợp cho mọi dịp đặc biệt.'}
          </Text>

          {/* Reviews summary */}
          <View style={{ marginTop: 8, marginBottom: 12 }}>
            {avgRating ? (
              <Text style={{ fontSize: 16, fontWeight: '700' }}>{avgRating} · {reviews.length} đánh giá</Text>
            ) : (
              <Text style={{ color: '#666' }}>Chưa có đánh giá cho sản phẩm này.</Text>
            )}

            {reviews.length > 0 && (
              <FlatList
                data={reviews}
                keyExtractor={(it) => it.id || Math.random().toString()}
                renderItem={({ item }) => (
                  <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Star size={14} color="#facc15" />
                      <Text style={{ marginLeft: 8, fontWeight: '600' }}>{item.rating}</Text>
                      <Text style={{ marginLeft: 8, color: '#666' }}>{item.userId ? ` · ${item.userId}` : ''}</Text>
                    </View>
                    {item.comment ? <Text style={{ marginTop: 6 }}>{item.comment}</Text> : null}
                  </View>
                )}
              />
            )}

            {canReview && (
              <TouchableOpacity onPress={() => setReviewModalOpen(true)} style={{ marginTop: 10 }}>
                <Text style={{ color: '#e11d48', fontWeight: '700' }}>Viết đánh giá cho sản phẩm này</Text>
              </TouchableOpacity>
            )}
          </View>

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

      {reviewModalOpen && (
        <Modal visible={reviewModalOpen} animationType="slide" transparent>
          <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)'}}>
            <View style={{width:'90%', backgroundColor:'#fff', borderRadius:8, padding:16}}>
              <Text style={{fontSize:18,fontWeight:'700'}}>Viết đánh giá</Text>
              <View style={{flexDirection:'row', marginTop:12}}>
                {[1,2,3,4,5].map((s)=>(
                  <TouchableOpacity key={s} onPress={() => setReviewRating(s)} style={{marginRight:6}}>
                    <Star size={24} color={s <= reviewRating ? '#facc15' : '#ddd'} />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput value={reviewComment} onChangeText={setReviewComment} placeholder="Viết nhận xét..." multiline style={{borderWidth:1,borderColor:'#eee',borderRadius:6,marginTop:12,padding:8, minHeight:80}} />
              <View style={{flexDirection:'row', justifyContent:'flex-end', marginTop:12}}>
                <TouchableOpacity onPress={() => setReviewModalOpen(false)} style={{marginRight:12}}>
                  <Text style={{color:'#666'}}>Huỷ</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={submitReview} style={{backgroundColor:'#e11d48', paddingHorizontal:16, paddingVertical:8, borderRadius:6}}>
                  <Text style={{color:'#fff'}}>Gửi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <View style={{ padding: 12, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Sản phẩm liên quan</Text>
          <FlatList
            data={related}
            horizontal
            keyExtractor={(item) => (item.docId ?? item.id).toString()}
            renderItem={({ item }) => (
              <View style={{ width: 140, marginRight: 12 }}>
                <TouchableOpacity onPress={() => onViewProduct ? onViewProduct(item) : setCurrent(item)}>
                  <Image source={{ uri: item.image_url }} style={{ width: 140, height: 100, borderRadius: 8 }} />
                </TouchableOpacity>
                <Text numberOfLines={2} style={{ marginTop: 6 }}>{item.name}</Text>
                <Text style={{ color: '#e11d48', fontWeight: '700' }}>₫ {(item.price ?? 0).toLocaleString()}</Text>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      onAddToCart && onAddToCart(item, 1);
                    } catch (e) {
                      console.warn('Add to cart failed for related item', e);
                    }
                  }}
                  style={{ marginTop: 8, backgroundColor: '#e11d48', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Thêm</Text>
                </TouchableOpacity>
              </View>
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

      {/* Review Modal */}
      <Modal visible={reviewModalOpen} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Đánh giá sản phẩm</Text>

            {/* Rating selector */}
            <Text style={{ fontSize: 14, marginBottom: 8 }}>Chọn điểm:</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((val) => (
                <TouchableOpacity key={val} onPress={() => setReviewRating(val)}>
                  <Star size={28} color={val <= reviewRating ? '#facc15' : '#ddd'} fill={val <= reviewRating ? '#facc15' : 'none'} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment input */}
            <Text style={{ fontSize: 14, marginBottom: 8 }}>Nhận xét (tùy chọn):</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, textAlignVertical: 'top' }}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={4}
            />

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setReviewModalOpen(false)}
                style={{ flex: 1, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8, alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '600' }}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={submitReview}
                style={{ flex: 1, padding: 12, backgroundColor: '#e11d48', borderRadius: 8, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Gửi đánh giá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
