# 🔍 Hướng Dẫn Cấu Hình Tìm Kiếm Sản Phẩm Firebase

## 📚 Mục Lục
1. [Cấu hình Backend](#1-cấu-hình-backend)
2. [Cấu hình Firebase](#2-cấu-hình-firebase)
3. [Cấu hình Frontend](#3-cấu-hình-frontend)
4. [Thử Nghiệm](#4-thử-nghiệm)
5. [Troubleshooting](#troubleshooting)

---

## 1. Cấu hình Backend

### Bước 1.1: Đảm bảo Backend Chạy

```bash
cd backend
npm install
npm start
```

✅ Backend sẽ chạy trên: `http://localhost:5000`

### Bước 1.2: Kiểm tra Server Logs

Bạn sẽ thấy:
```
✅ Firebase Admin initialized successfully
🌸 Flower Shop API Server
📡 Server running on port 5000
📋 Available endpoints:
   - GET  /search?q=<query>&category=<category>&minPrice=<min>&maxPrice=<max>
   - GET  /products
   - GET  /categories
```

---

## 2. Cấu hình Firebase

### Bước 2.1: Kiểm tra Firestore Collections

1. Đi tới [Firebase Console](https://console.firebase.google.com)
2. Chọn project của bạn
3. Chọn **Firestore Database**
4. Tạo 2 collections:
   - `products` (cho sản phẩm)
   - `categories` (cho danh mục)

### Bước 2.2: Thêm Dữ Liệu Mẫu

Sử dụng dữ liệu từ `data/sampleFirebaseData.ts`:

**Cách 1: Sử dụng Firebase Console**
- Mở Firestore Database
- Click "Add Collection" → tên: `products`
- Click "Add Document"
- Sao chép dữ liệu từ `SAMPLE_FIREBASE_PRODUCTS` vào
- Lặp lại cho `categories` và `SAMPLE_CATEGORIES`

**Cách 2: Sử dụng Firebase CLI (Nhanh hơn)**
```bash
firebase login
firebase shell
db.collection('products').add({...}) // Thêm từng sản phẩm
```

**Cách 3: Sử dụng Script Node.js**
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const { SAMPLE_FIREBASE_PRODUCTS, SAMPLE_CATEGORIES } = require('../data/sampleFirebaseData');

// Thêm products
SAMPLE_FIREBASE_PRODUCTS.forEach(product => {
  db.collection('products').doc(product.id).set(product);
});

// Thêm categories
SAMPLE_CATEGORIES.forEach(category => {
  db.collection('categories').doc(category.id).set(category);
});

console.log('✅ Data imported successfully');
```

### Bước 2.3: Cấu hình Firestore Rules

Vào **Firestore Database** → **Rules** → Cập nhật:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read products
    match /products/{document=**} {
      allow read: if true;
      allow write: if false; // Chỉ admin có thể write
    }
    
    // Allow anyone to read categories  
    match /categories/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

Click **Publish**

---

## 3. Cấu hình Frontend

### Bước 3.1: Cập nhật Backend URL

Chỉnh sửa `config/environment.ts`:

```typescript
export const BACKEND_CONFIG = {
  // Nếu trên máy cục bộ:
  API_BASE_URL: "http://192.168.1.100:5000", // Thay với IP của bạn
  
  // Hoặc nếu chạy emulator:
  // API_BASE_URL: "http://localhost:5000",
  
  // Hoặc nếu deploy:
  // API_BASE_URL: "https://api.yourserver.com",
};
```

**Cách tìm IP của máy chủ:**
- **Windows**: Mở Command Prompt, gõ `ipconfig`
- **Mac/Linux**: Mở Terminal, gõ `ifconfig`
- Tìm IPv4 Address (thường bắt đầu với 192.168.x.x)

### Bước 3.2: Kiểm tra Kết Nối

```typescript
import { API_BASE_URL } from "../utils/firebaseAPI";

// Test kết nối
fetch(`${API_BASE_URL}/health`)
  .then(res => res.json())
  .then(data => console.log("✅ Server connected:", data))
  .catch(err => console.error("❌ Connection failed:", err));
```

---

## 4. Thử Nghiệm

### Cách 1: Test trực tiếp trong app

1. Mở app React Native
2. Chuyển đến Search Screen
3. Click nút **Firebase** để bật tìm kiếm Firebase
4. Nhập từ khóa (vd: "hoa")
5. Bấm Search

### Cách 2: Test API từ Postman/Thunder Client

**Search Products:**
```
GET http://192.168.1.100:5000/search?q=hoa
```

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "rose_red_001",
      "name": "Hoa Hồng Đỏ Tươi",
      "price": 150000,
      "image": "...",
      "description": "..."
    }
  ],
  "count": 1
}
```

**Get All Products:**
```
GET http://192.168.1.100:5000/products
```

**Get Categories:**
```
GET http://192.168.1.100:5000/categories
```

### Cách 3: Test từ Browser

Mở URL này trong browser:
```
http://192.168.1.100:5000/search?q=hoa&category=rose
```

---

## Troubleshooting

### ❌ Lỗi: "Connection Refused"
- ✅ Kiểm tra backend đang chạy: `npm start`
- ✅ Kiểm tra port 5000 không bị chiếm: `netstat -ano | findstr :5000`
- ✅ Kiểm tra tường lửa cho phép port 5000

### ❌ Lỗi: "Cannot reach server"
- ✅ Kiểm tra IP backend: `ipconfig` (Windows) hoặc `ifconfig` (Mac/Linux)
- ✅ Ping từ thiết bị: `ping 192.168.1.100`
- ✅ Đảm bảo cả hai trên cùng WiFi network

### ❌ Lỗi: "FIRESTORE_AUTH_ERROR"
- ✅ Kiểm tra `serviceAccountKey.json` có trong `backend/`
- ✅ Cấu hình Firestore Rules đúng (see 2.3)
- ✅ Check Firebase credentials hợp lệ

### ❌ Không có kết quả tìm kiếm
- ✅ Kiểm tra dữ liệu trong Firestore (Products collection)
- ✅ Kiểm tra từ khóa có trùng khớp (tìm kiếm không phân biệt hoa thường)
- ✅ Xem logs từ backend: console sẽ hiển thị search queries

### ❌ Ứng dụng bị crash khi search
- ✅ Kiểm tra React Native debugger cho errors
- ✅ Xem backend logs có lỗi gì
- ✅ Thử reset app: `npx expo start -c`

---

## 🎯 Cheatsheet Lệnh Nhanh

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
npx expo start

# Reset project
npx expo start -c

# Test API
curl "http://localhost:5000/search?q=hoa"

# Check Firebase status
firebase status

# Deploy rules
firebase deploy --only firestore:rules
```

---

## 📱 Sử dụng Hooks

```typescript
import { useFirebaseSearch } from "../hooks/useFirebaseSearch";

function MyComponent() {
  const { results, loading, error, search } = useFirebaseSearch({
    onSuccess: (results) => console.log("Found:", results),
    onError: (error) => console.error("Search failed:", error),
  });

  const handleSearch = (query: string) => {
    search({ query });
  };

  return (
    <View>
      {loading && <ActivityIndicator />}
      {error && <Text>{error.message}</Text>}
      {results.map(product => (
        <Text key={product.id}>{product.name}</Text>
      ))}
    </View>
  );
}
```

---

## ✅ Kiểm Tra Cuối Cùng

- [ ] Backend chạy đúng
- [ ] Firestore có dữ liệu
- [ ] API URL cấu hình đúng
- [ ] Firestore Rules đúng
- [ ] App có thể kết nối backend
- [ ] Tìm kiếm trả về kết quả

Nếu tất cả ✅ → **Bạn đã sẵn sàng!** 🎉
