#!/bin/bash
# Quick Start Script cho Firebase Product Search

echo "🌸 Flower Shop - Firebase Search Setup"
echo "======================================"

# 1. Backend Setup
echo ""
echo "📦 Step 1: Chuẩn bị Backend"
echo "Chạy lệnh này trong Terminal 1:"
echo "cd backend && npm install && npm start"
read -p "Đã chạy backend? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 2. Check Backend
echo ""
echo "🔍 Step 2: Kiểm tra Backend"
echo "Kiểm tra server chạy được trên:"
echo "- Terminal log có ✅ Firebase Admin initialized successfully"
echo "- Terminal log có 📡 Server running on port 5000"
read -p "Backend đã chạy thành công? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Vui lòng kiểm tra lại backend"
    exit 1
fi

# 3. Firestore Setup
echo ""
echo "📊 Step 3: Chuẩn bị Firestore"
echo ""
echo "Vui lòng thực hiện bước sau:"
echo "1. Mở Firebase Console: https://console.firebase.google.com"
echo "2. Chọn project của bạn"
echo "3. Chọn Firestore Database"
echo "4. Tạo 2 collections:"
echo "   - products (thêm dữ liệu từ SAMPLE_FIREBASE_PRODUCTS)"
echo "   - categories (thêm dữ liệu từ SAMPLE_CATEGORIES)"
echo ""
echo "📁 Dữ liệu mẫu trong: data/sampleFirebaseData.ts"
read -p "Đã tạo Firestore collections? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  Bạn cần tạo collections trước khi tiếp tục"
fi

# 4. Update Config
echo ""
echo "⚙️ Step 4: Cập nhật Configuration"
echo ""
echo "Chỉnh sửa file: config/environment.ts"
echo "Thay đổi API_BASE_URL thành IP của máy backend của bạn"
echo ""
echo "Tìm IP:"
echo "- Windows: Mở CMD, gõ 'ipconfig'"
echo "- Mac/Linux: Mở Terminal, gõ 'ifconfig'"
echo ""
read -p "Đã cập nhật API_BASE_URL? (y/n) " -n 1 -r
echo

# 5. Run Frontend
echo ""
echo "📱 Step 5: Chạy Frontend"
echo "Chạy lệnh này trong Terminal 2:"
echo "npx expo start"
read -p "Đã chạy frontend? (y/n) " -n 1 -r
echo

# 6. Test Search
echo ""
echo "🧪 Step 6: Thử Nghiệm"
echo ""
echo "Trong app:"
echo "1. Mở Search Screen"
echo "2. Click nút 'Firebase' để bật (nút sẽ chuyển thành 🔥 Firebase)"
echo "3. Nhập từ khóa: 'hoa'"
echo "4. Bấm Search"
echo "5. Kết quả sẽ hiển thị từ Firestore"
echo ""
read -p "Tìm kiếm thành công? (y/n) " -n 1 -r
echo

# 7. Final Check
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "✅ Setup hoàn tất thành công!"
    echo ""
    echo "📚 Tài liệu:"
    echo "- FIREBASE_SEARCH_GUIDE.md - Hướng dẫn chi tiết"
    echo "- SETUP_FIREBASE_SEARCH.md - Setup từ A-Z"
    echo "- IMPLEMENTATION_SUMMARY.md - Tóm tắt code"
else
    echo ""
    echo "❌ Có lỗi trong quá trình setup"
    echo "Vui lòng xem TROUBLESHOOTING trong SETUP_FIREBASE_SEARCH.md"
fi
