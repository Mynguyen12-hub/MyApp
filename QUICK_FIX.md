# 🚀 Quick Fix - Ảnh Không Hiển Thị

## ⚡ Các Sửa Lỗi Nhanh

### 1. **Nếu vẫn không thấy ảnh:**

**Bước 1: Mở Debugger**
```bash
# Terminal
npx expo start
# Bấm 'd' hoặc 'j' để mở debugger
```

**Bước 2: Xem Console Logs**
- Mở Chrome DevTools (F12 hoặc Cmd+Option+I)
- Chuyển đến Console tab
- Tìm logs từ SearchScreen

**Bước 3: Kiểm tra Error**
- Nếu thấy: `✅ Image loaded` → **Ảnh OK, UI có vấn đề**
- Nếu thấy: `❌ Image failed` → **URL sai hoặc mạng lỗi**

---

### 2. **Sửa Nhanh - Dùng Placeholder URLs**

Thay SAMPLE_PRODUCTS trong SearchScreen.tsx:

```typescript
const SAMPLE_PRODUCTS = [
  {
    id: "1",
    name: "Hoa Hồng Đỏ",
    price: "150.000",
    image: "https://via.placeholder.com/160x160/ff69b4/ffffff?text=Rose",
  },
  {
    id: "2",
    name: "Hoa Tulip",
    price: "200.000",
    image: "https://via.placeholder.com/160x160/ffff00/000000?text=Tulip",
  },
];
```

---

### 3. **Sửa Nhanh - Local Images**

Nếu có ảnh trong `assets/images/`:

```typescript
const SAMPLE_PRODUCTS = [
  {
    id: "1",
    name: "Hoa Hồng Đỏ",
    price: "150.000",
    image: require("../assets/images/rose.png"), // ← Local image
  },
];
```

---

### 4. **Kiểm Tra Network**

```bash
# Ping URL để xác nhận có kết nối
ping images.unsplash.com

# Hoặc dùng curl
curl -I https://images.unsplash.com/photo-1519681393784-d120267933ba
```

---

## 📱 Test Nhanh Trên Device

1. **Chạy app**
   ```bash
   npx expo start
   # Scan QR code bằng phone
   ```

2. **Mở Search Screen**

3. **Nhập search: "hoa"**

4. **Bấm Search**

5. **Kết quả:**
   - ✅ Ảnh hiển thị → **Success!**
   - ❌ Không thấy ảnh → Kiểm tra logs

---

## 🔍 Nếu Vẫn Có Vấn Đề

### Bước 1: Xóa cache
```bash
# Stopext-natively server (Ctrl+C)
# Clear cache
npx expo start -c
```

### Bước 2: Reset project
```bash
npm install
npx expo start -c
```

### Bước 3: Xem logs chi tiết
```typescript
// Thêm vào SearchScreen.tsx ngay sau import
console.log("🔥 SearchScreen Mounted");

// Thêm vào renderItem
<Image
  onLoad={() => console.log("✅ Image loaded:", item.name)}
  onError={(e) => console.error("❌ Image error:", item.name, e)}
/>
```

---

## ✨ Expected Result

Khi chạy tìm kiếm, bạn sẽ thấy:

```
[Grid Layout 2 Columns]
┌────────────┐  ┌────────────┐
│            │  │            │
│   Image    │  │   Image    │
│            │  │            │
│ Hoa Hồng   │  │ Hoa Tulip  │
│ 150.000 đ  │  │ 200.000 đ  │
└────────────┘  └────────────┘
```

---

## 💡 Notes

- Image URL phải bắt đầu với `http://` hoặc `https://`
- Image phải có width & height style
- Placeholder sẽ hiển thị nếu ảnh fail
- Console logs sẽ giúp xác định vấn đề

**✅ Done! Ảnh sẽ hiển thị bình thường.**
