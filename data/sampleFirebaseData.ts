/**
 * Sample Products Data
 * Mẫu dữ liệu sản phẩm để import vào Firebase Firestore
 * 
 * Hướng dẫn: Tạo collection "products" trong Firestore và import dữ liệu này
 */

export const SAMPLE_FIREBASE_PRODUCTS = [
  {
    id: "rose_red_001",
    name: "Hoa Hồng Đỏ Tươi",
    description: "Bó hoa hồng đỏ tươi sáng, thích hợp tặng quà",
    price: 150000,
    category: "rose",
    tags: ["hoa", "đỏ", "hồng", "tình yêu", "quà tặng"],
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=80",
    stock: 50,
    rating: 4.8,
    reviews: 125,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "tulip_yellow_001",
    description: "Hoa tulip vàng xinh đẹp, tượng trưng cho sự may mắn",
    name: "Hoa Tulip Vàng",
    price: 200000,
    category: "tulip",
    tags: ["hoa", "vàng", "tulip", "may mắn", "trang trí"],
    image: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=500&q=80",
    stock: 30,
    rating: 4.6,
    reviews: 98,
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "sunflower_001",
    name: "Hoa Hướng Dương",
    description: "Bó hoa hướng dương lớn, tượng trưng cho sự vui vẻ",
    price: 180000,
    category: "sunflower",
    tags: ["hoa", "hướng dương", "vàng", "vui vẻ", "trang trí"],
    image: "https://images.unsplash.com/photo-1597848212624-e2d27ba5653f?w=500&q=80",
    stock: 40,
    rating: 4.7,
    reviews: 110,
    createdAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "lily_white_001",
    name: "Hoa Loa Kèn Trắng",
    description: "Hoa loa kèn trắng thanh lịch, thích hợp trang trí",
    price: 220000,
    category: "lily",
    tags: ["hoa", "trắng", "loa kèn", "thanh lịch", "trang trí"],
    image: "https://images.unsplash.com/photo-1611339555312-e607c90352fd?w=500&q=80",
    stock: 25,
    rating: 4.9,
    reviews: 89,
    createdAt: "2024-01-04T00:00:00Z",
  },
  {
    id: "orchid_purple_001",
    name: "Hoa Lan Tím",
    description: "Bó hoa lan tím quý phái, biểu tượng của nhan sắc",
    price: 350000,
    category: "orchid",
    tags: ["hoa", "tím", "lan", "quý phái", "nhan sắc"],
    image: "https://images.unsplash.com/photo-1597848212624-e2d27ba5653f?w=500&q=80",
    stock: 15,
    rating: 5.0,
    reviews: 76,
    createdAt: "2024-01-05T00:00:00Z",
  },
  {
    id: "daisy_pink_001",
    name: "Hoa Cúc Hồng",
    description: "Bó hoa cúc hồng nhẹ nhàng, thích hợp tặng bạn gái",
    price: 120000,
    category: "daisy",
    tags: ["hoa", "hồng", "cúc", "nhẹ nhàng", "quà tặng"],
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&q=80",
    stock: 60,
    rating: 4.5,
    reviews: 142,
    createdAt: "2024-01-06T00:00:00Z",
  },
  {
    id: "rose_pink_001",
    name: "Hoa Hồng Hồng Nhạt",
    description: "Bó hoa hồng hồng nhạt tuyệt đẹp, biểu tượng của sự biết ơn",
    price: 160000,
    category: "rose",
    tags: ["hoa", "hồng nhạt", "hồng", "biết ơn", "quà tặng"],
    image: "https://images.unsplash.com/photo-1585230907009-8d13b97c9ffe?w=500&q=80",
    stock: 45,
    rating: 4.7,
    reviews: 115,
    createdAt: "2024-01-07T00:00:00Z",
  },
  {
    id: "peony_001",
    name: "Hoa Mẫu Đơn",
    description: "Hoa mẫu đơn hồng đầy sang trọng, tượng trưng của sự giàu có",
    price: 320000,
    category: "peony",
    tags: ["hoa", "mẫu đơn", "hồng", "sang trọng", "giàu có"],
    image: "https://images.unsplash.com/photo-1603784212256-b55f0825e7a6?w=500&q=80",
    stock: 20,
    rating: 4.8,
    reviews: 85,
    createdAt: "2024-01-08T00:00:00Z",
  },
];

/**
 * Sample Categories
 * Tạo collection "categories" với dữ liệu này
 */
export const SAMPLE_CATEGORIES = [
  {
    id: "rose",
    name: "Hoa Hồng",
    description: "Các loại hoa hồng đẹp",
    icon: "🌹",
  },
  {
    id: "tulip",
    name: "Hoa Tulip",
    description: "Các loại hoa tulip tươi sáng",
    icon: "🌷",
  },
  {
    id: "sunflower",
    name: "Hoa Hướng Dương",
    description: "Hoa hướng dương vui vẻ",
    icon: "🌻",
  },
  {
    id: "lily",
    name: "Hoa Loa Kèn",
    description: "Hoa loa kèn thanh lịch",
    icon: "🌸",
  },
  {
    id: "orchid",
    name: "Hoa Lan",
    description: "Hoa lan quý phái",
    icon: "🌺",
  },
  {
    id: "daisy",
    name: "Hoa Cúc",
    description: "Hoa cúc nhẹ nhàng",
    icon: "🌼",
  },
  {
    id: "peony",
    name: "Hoa Mẫu Đơn",
    description: "Hoa mẫu đơn sang trọng",
    icon: "🌷",
  },
];

/**
 * Hướng dẫn import dữ liệu vào Firebase:
 * 
 * 1. Mở Firebase Console (https://console.firebase.google.com)
 * 2. Chọn project của bạn
 * 3. Đi tới Firestore Database
 * 4. Tạo collection mới tên "products"
 * 5. Thêm các document từ SAMPLE_FIREBASE_PRODUCTS
 * 
 * Hoặc sử dụng Firebase Admin SDK:
 * 
 * const admin = require('firebase-admin');
 * const db = admin.firestore();
 * 
 * // Thêm products
 * SAMPLE_FIREBASE_PRODUCTS.forEach(product => {
 *   db.collection('products').doc(product.id).set(product);
 * });
 * 
 * // Thêm categories
 * SAMPLE_CATEGORIES.forEach(category => {
 *   db.collection('categories').doc(category.id).set(category);
 * });
 */
