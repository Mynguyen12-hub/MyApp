/**
 * Test Image Loading Script
 * Chạy script này trong React Native Debugger để test URL ảnh
 */

// Dán code này vào React Native Debugger Console (Cmd+Option+I on Mac, F12 on Windows)

console.log("🧪 Testing Image URLs...\n");

const imageUrls = [
  {
    name: "Hoa Hồng Đỏ (Unsplash)",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=80"
  },
  {
    name: "Hoa Tulip (Unsplash)",
    url: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=500&q=80"
  },
  {
    name: "Hoa Hướng Dương (Unsplash)",
    url: "https://images.unsplash.com/photo-1597848212624-e2d27ba5653f?w=500&q=80"
  },
  {
    name: "Placeholder",
    url: "https://via.placeholder.com/160x160?text=Hoa"
  }
];

// Test fetch
async function testImageUrl(name, url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      console.log(`✅ ${name}`);
      console.log(`   URL: ${url}`);
      console.log(`   Status: ${response.status}`);
    } else {
      console.log(`⚠️ ${name}`);
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Run tests
imageUrls.forEach(img => testImageUrl(img.name, img.url));

console.log("\n💡 Tips:");
console.log("  • Nếu tất cả ✅ → URLs OK, vấn đề ở component");
console.log("  • Nếu có ❌ → Check URL hoặc kết nối mạng");
console.log("  • Kiểm tra SearchScreen logs (onLoad/onError)");
