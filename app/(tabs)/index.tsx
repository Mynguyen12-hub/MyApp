import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Menu, ShoppingCart, Search, Home as HomeIcon, Grid3x3, Package, Heart, User } from 'lucide-react-native';
import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';
interface Product {
id: number;
name: string;
price: number;
image: string;
category: string;
}

const products: Product[] = [
  { id: 1, name: 'Bó Hoa Hồng', price: 450000, image: require('@/assets/images/hoahong.jpg'), category: 'Hoa Hồng' },
  { id: 2, name: 'Hoa Tulip Trắng', price: 320000, image: require('@/assets/images/hoatulip.jpg'), category: 'Hoa Tulip' },
  { id: 3, name: 'Hoa Hướng Dương', price: 380000, image: require('@/assets/images/hoahuongduong.jpg'), category: 'Hoa Hướng Dương' },
  { id: 4, name: 'Hoa Lavender', price: 290000, image: require('@/assets/images/hoalavender.jpg'), category: 'Hoa Lavender' },
];

const categories = ['Tất Cả', 'Hoa Hồng', 'Hoa Tulip', 'Hoa Hướng Dương', 'Hoa Lavender'];

export default function HomeScreen() {
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategory, setSelectedCategory] = useState('Tất Cả');
const [favorites, setFavorites] = useState<number[]>([]);
const [cartItems, setCartItems] = useState<Product[]>([]);

const filteredProducts = products.filter(
(p) => (selectedCategory === 'Tất Cả' || p.category === selectedCategory) &&
p.name.toLowerCase().includes(searchQuery.toLowerCase())
);

const toggleFavorite = (id: number) => {
setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
};

const addToCart = (product: Product) => {
setCartItems(prev => [...prev, product]);
};

return (
  <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
    {/* Header */}
    <View style={styles.header}>
      <Menu width={24} height={24} />
      <ThemedText type="title">Cửa Hàng Hoa</ThemedText>
      <View>
        <ShoppingCart width={24} height={24} />
        {cartItems.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
          </View>
        )}
      </View>
    </View>
  {/* Search & Categories */}
  <View style={styles.searchContainer}>
    <View style={styles.searchBox}>
      <Search width={20} height={20} />
      <TextInput
        placeholder="Tìm kiếm hoa..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />
    </View>

    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
      <View style={{ flexDirection: 'row' }}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[styles.categoryBtn, selectedCategory === cat && styles.categorySelected]}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && { color: 'white' }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  </View>

  {/* Product List */}
  <ScrollView contentContainerStyle={{ paddingHorizontal: 10 }}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {filteredProducts.map(p => (
        <View key={p.id} style={{ width: '48%', marginBottom: 10 }}>
          <View style={styles.productCard}>
      <Image
        source={p.image}        // Chỉ cần truyền URL string
        style={styles.productImage}
        contentFit="cover"/>      
        <ThemedText type="subtitle">{p.name}</ThemedText>
            <ThemedText type="defaultSemiBold">{p.price.toLocaleString()}₫</ThemedText>
            <TouchableOpacity onPress={() => toggleFavorite(p.id)} style={styles.favoriteBtn}>
              <Heart width={20} height={20} color={favorites.includes(p.id) ? 'red' : 'gray'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addToCart(p)} style={styles.addToCartBtn}>
              <Text style={{ color: 'white' }}>Thêm vào giỏ</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  </ScrollView>

  {/* Bottom Navigation */}
  {/* <View style={styles.bottomNav}>
    <TouchableOpacity style={styles.navItem}><HomeIcon width={24} height={24} color="pink" /><Text style={styles.navTextActive}>Trang Chủ</Text></TouchableOpacity>
    <TouchableOpacity style={styles.navItem}><Grid3x3 width={24} height={24} /><Text style={styles.navText}>Danh Mục</Text></TouchableOpacity>
    <TouchableOpacity style={styles.navItem}><Package width={24} height={24} /><Text style={styles.navText}>Đơn Hàng</Text></TouchableOpacity>
    <TouchableOpacity style={styles.navItem}><Heart width={24} height={24} /><Text style={styles.navText}>Yêu Thích</Text></TouchableOpacity>
    <TouchableOpacity style={styles.navItem}><User width={24} height={24} /><Text style={styles.navText}>Tài Khoản</Text></TouchableOpacity>
  </View> */}
  </ScrollView>

);
}

const styles = StyleSheet.create({
header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: 'white' },
cartBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: 'pink', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
cartBadgeText: { color: 'white', fontSize: 10 },
searchContainer: { padding: 10 },
searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f1f1', borderRadius: 10, paddingHorizontal: 10 },
searchInput: { flex: 1, marginLeft: 5, height: 35 },
categoryBtn: { paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, backgroundColor: '#eee', marginRight: 5 },
categorySelected: { backgroundColor: 'pink' },
categoryText: { color: '#555' },
productCard: { backgroundColor: 'white', borderRadius: 10, padding: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
productImage: { width: '100%', height: 120, borderRadius: 8, marginBottom: 5 },
favoriteBtn: { position: 'absolute', top: 5, right: 5 },
addToCartBtn: { marginTop: 5, backgroundColor: 'pink', borderRadius: 8, paddingVertical: 5, alignItems: 'center' },
bottomNav: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#ccc', backgroundColor: 'white', paddingVertical: 5 },
navItem: { flex: 1, alignItems: 'center' },
navText: { fontSize: 10, color: '#555' },
});
