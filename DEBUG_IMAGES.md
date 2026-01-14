# 🖼️ Hướng Dẫn Debug - Ảnh Không Hiển Thị

## 🔍 Các Nguyên Nhân Thường Gặp

### 1. **URL Ảnh Không Hợp Lệ**
```typescript
// ❌ SAI
image: "ảnh.jpg"
image: "C:\\images\\flower.jpg"  // Đường dẫn cục bộ

// ✅ ĐÚNG
image: "https://images.unsplash.com/photo-xxx?w=500"
```

### 2. **Không Có Kết Nối Mạng**
- Đảm bảo WiFi/4G kết nối
- Ping: `ping images.unsplash.com`

### 3. **Domain Bị Chặn**
- Một số domain không hỗ trợ cross-origin
- Thử domain khác

### 4. **Image Component Không Render**
- Kiểm tra `style={styles.productImage}`
- Đảm bảo height/width được set

---

## 🧪 Cách Test

### Step 1: Dùng ImageTestScreen Component

```bash
# Thêm route vào app/_layout.tsx
<Stack.Screen name="image-test" component={ImageTestScreen} />

# Hoặc test trực tiếp bằng fetch
fetch("https://images.unsplash.com/photo-xxx")
  .then(r => console.log("✅ Image URL OK:", r.ok))
  .catch(e => console.error("❌ Error:", e))
```

### Step 2: Kiểm tra Console Logs

```typescript
// Thêm vào SearchScreen.tsx
<Image
  source={{ uri: item.image }}
  style={styles.productImage}
  onLoad={() => console.log(`✅ Image loaded: ${item.id}`)}
  onError={() => console.log(`❌ Image failed: ${item.id}`)}
/>
```

### Step 3: Dùng React Native Debugger
1. Mở app: `npx expo start`
2. Bấm `d` (mở debugger)
3. Xem Chrome DevTools → Console
4. Tìm messages từ `onLoad`/`onError`

---

## 📋 Checklist

- [ ] URL ảnh bắt đầu bằng `https://`
- [ ] URL có truy cập được từ browser (copy URL vào browser test)
- [ ] Có kết nối WiFi/4G
- [ ] `productImage` style có width & height
- [ ] `productImageContainer` có height (160)
- [ ] `resizeMode: "cover"` được set
- [ ] Console không có lỗi CORS
- [ ] Product data có field `image`

---

## 🔧 Sửa Lỗi

### Nếu ảnh vẫn không hiển thị:

**1. Thêm fallback ảnh**
```typescript
<Image
  source={{
    uri: item.image || "https://via.placeholder.com/160?text=No+Image"
  }}
  style={styles.productImage}
/>
```

**2. Dùng base64 image**
```typescript
<Image
  source={{
    uri: "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }}
/>
```

**3. Cache ảnh**
```typescript
<Image
  source={{
    uri: item.image,
    cache: 'force-cache'
  }}
/>
```

---

## 📸 URLs Ảnh Tốt

Dùng Unsplash (free, không cần API key):
```
https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=80
https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=500&q=80
https://images.unsplash.com/photo-1597848212624-e2d27ba5653f?w=500&q=80
```

Hoặc placeholder:
```
https://via.placeholder.com/160x160?text=Hoa+Hong
```

---

## 💡 Tips

1. **Test ảnh offline**: Dùng image require()
   ```typescript
   image: require("../assets/images/flower.png")
   ```

2. **Progressive image loading**:
   ```typescript
   <Image
     source={{ uri: item.image }}
     onLoadStart={() => setLoading(true)}
     onLoadEnd={() => setLoading(false)}
   />
   ```

3. **Image dimensions**:
   ```typescript
   const [imageDimensions, setImageDimensions] = useState({width: 0, height: 0});
   
   Image.getSize(item.image, (w, h) => {
     setImageDimensions({width: w, height: h});
   });
   ```

---

## 🐛 Debugging Tool

Thêm vào SearchScreen để log tất cả ảnh:

```typescript
useEffect(() => {
  console.log("📊 SearchScreen Data:");
  results.forEach(item => {
    console.log(`  ${item.name}: ${item.image}`);
  });
}, [results]);
```

---

## 📞 Liên Hệ

Nếu vẫn có vấn đề:
1. Mở ImageTestScreen component
2. Kiểm tra log output
3. Test URLs trực tiếp trong browser
4. Kiểm tra kết nối mạng
