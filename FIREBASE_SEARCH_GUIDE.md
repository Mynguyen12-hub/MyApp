# 🔍 Firebase Product Search Guide

Hướng dẫn này giúp bạn cấu hình tính năng tìm kiếm sản phẩm dựa trên Firebase.

## 📋 Yêu cầu

- Backend Express server chạy (xem [backend/README.md](./backend/README.md))
- Firebase Firestore được cấu hình với collection `products`
- Cấu hình CORS trên backend

## 🚀 Bước cấu hình

### 1. Cấu hình Backend API URL

Chỉnh sửa file [utils/firebaseAPI.ts](./utils/firebaseAPI.ts):

```typescript
export const API_BASE_URL = "http://192.168.1.100:5000"; // Thay đổi thành IP của máy chủ backend
```

### 2. Chuẩn bị dữ liệu Firebase

Tạo collection `products` trong Firebase Firestore với cấu trúc sau:

```json
{
  "products": {
    "product_id_1": {
      "name": "Hoa Hồng Đỏ",
      "description": "Hoa hồng đỏ tươi sáng",
      "price": 150000,
      "category": "rose",
      "tags": ["hoa", "đỏ", "hồng"],
      "image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=80"
    },
    "product_id_2": {
      "name": "Hoa Tulip Vàng",
      "description": "Hoa tulip vàng xinh đẹp",
      "price": 200000,
      "category": "tulip",
      "tags": ["hoa", "vàng", "tulip"],
      "image": "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=500&q=80"
    }
  }
}
```

### 3. Chạy Backend Server

```bash
cd backend
npm install
npm start
```

Server sẽ chạy trên `http://localhost:5000` hoặc theo cấu hình của bạn.

### 4. Bật Firebase Search trong ứng dụng

Trong `SearchScreen.tsx`, nhấp nút **Firebase** để bật tìm kiếm từ Firebase.

---

## 🔌 API Endpoints

### Tìm kiếm sản phẩm
```http
GET /search?q=<query>&category=<category>&minPrice=<min>&maxPrice=<max>
```

**Query Parameters:**
- `q` (optional): Từ khóa tìm kiếm
- `category` (optional): Danh mục sản phẩm
- `minPrice` (optional): Giá tối thiểu
- `maxPrice` (optional): Giá tối đa

**Example:**
```
GET /search?q=hoa&category=rose&minPrice=100000&maxPrice=300000
```

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "product_id_1",
      "name": "Hoa Hồng Đỏ",
      "price": 150000,
      "image": "...",
      "description": "...",
      "category": "rose",
      "tags": ["hoa", "đỏ", "hồng"]
    }
  ],
  "count": 1,
  "query": "hoa",
  "filters": {
    "category": "rose",
    "priceRange": { "min": 100000, "max": 300000 }
  }
}
```

### Lấy tất cả sản phẩm
```http
GET /products
```

### Lấy tất cả danh mục
```http
GET /categories
```

---

## 🔧 Cấu hình Firestore Security Rules

Để cho phép ứng dụng đọc dữ liệu:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read products
    match /products/{document=**} {
      allow read: if true;
    }
    
    // Allow anyone to read categories
    match /categories/{document=**} {
      allow read: if true;
    }
    
    // Add more restrictive rules for production
  }
}
```

---

## 🐛 Troubleshooting

### Lỗi: "Không thể kết nối đến máy chủ"

1. Kiểm tra `API_BASE_URL` trong `utils/firebaseAPI.ts`
2. Đảm bảo backend server đang chạy
3. Kiểm tra kết nối mạng (WiFi/Ethernet)
4. Thử ping đến máy chủ từ thiết bị:
   ```bash
   ping 192.168.1.100
   ```

### Lỗi: "FIRESTORE_AUTH_ERROR"

1. Kiểm tra Firestore Security Rules
2. Đảm bảo serviceAccountKey.json được cấu hình đúng
3. Kiểm tra Firebase credentials trong backend

### Không có kết quả tìm kiếm

1. Kiểm tra dữ liệu trong Firestore (đầy đủ trường `name`, `description`)
2. Xác minh từ khóa tìm kiếm có trùng khớp
3. Kiểm tra logs từ backend: `npm start`

---

## 📱 Sử dụng trong ứng dụng

### Tìm kiếm sở thích

```typescript
import { searchProducts } from "../utils/firebaseAPI";

// Tìm kiếm đơn giản
const results = await searchProducts({ query: "hoa" });

// Tìm kiếm với bộ lọc
const filtered = await searchProducts({
  query: "hoa",
  category: "rose",
  minPrice: 100000,
  maxPrice: 300000
});
```

### Tìm kiếm theo danh mục

```typescript
import { searchByCategory } from "../utils/firebaseAPI";

const roses = await searchByCategory("rose");
```

### Tìm kiếm theo khoảng giá

```typescript
import { searchByPriceRange } from "../utils/firebaseAPI";

const affordable = await searchByPriceRange(100000, 300000);
```

---

## 🎯 Tính năng bổ sung

### OCR / Computer Vision Search (Future)
Hiện tại, tìm kiếm hình ảnh trả về "hoa" mặc định. Có thể tích hợp:
- Google Cloud Vision API
- AWS Rekognition
- Azure Computer Vision

### Autocomplete Search
Thêm suggestion khi nhập:
```typescript
export const getSearchSuggestions = async (query: string) => {
  // Trả về các gợi ý từ Firestore
};
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console logs (React Native debugger)
2. Kiểm tra server logs từ backend
3. Xem lại cấu hình Firestore
4. Thử reset tất cả dữ liệu và upload lại
