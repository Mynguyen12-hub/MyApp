#!/usr/bin/env pwsh
# Quick Start Script cho Firebase Product Search (Windows)

Write-Host "🌸 Flower Shop - Firebase Search Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# 1. Backend Setup
Write-Host ""
Write-Host "📦 Step 1: Chuẩn bị Backend" -ForegroundColor Yellow
Write-Host "Chạy lệnh này trong PowerShell Terminal 1:" -ForegroundColor Gray
Write-Host "cd backend; npm install; npm start" -ForegroundColor White -BackgroundColor Blue
Read-Host "Đã chạy backend? (nhấn Enter để tiếp tục)"

# 2. Check Backend
Write-Host ""
Write-Host "🔍 Step 2: Kiểm tra Backend" -ForegroundColor Yellow
Write-Host "Kiểm tra server chạy được trên:" -ForegroundColor Gray
Write-Host "- Terminal log có ✅ Firebase Admin initialized successfully"
Write-Host "- Terminal log có 📡 Server running on port 5000"

$backendOk = Read-Host "Backend đã chạy thành công? (y/n)"
if ($backendOk -ne 'y' -and $backendOk -ne 'Y') {
    Write-Host "❌ Vui lòng kiểm tra lại backend" -ForegroundColor Red
    exit
}

# 3. Firestore Setup
Write-Host ""
Write-Host "📊 Step 3: Chuẩn bị Firestore" -ForegroundColor Yellow
Write-Host ""
Write-Host "Vui lòng thực hiện các bước sau:" -ForegroundColor Gray
Write-Host "1. Mở Firebase Console: https://console.firebase.google.com"
Write-Host "2. Chọn project của bạn"
Write-Host "3. Chọn Firestore Database"
Write-Host "4. Tạo 2 collections:"
Write-Host "   - products (thêm dữ liệu từ SAMPLE_FIREBASE_PRODUCTS)"
Write-Host "   - categories (thêm dữ liệu từ SAMPLE_CATEGORIES)"
Write-Host ""
Write-Host "📁 Dữ liệu mẫu trong: data/sampleFirebaseData.ts" -ForegroundColor White

$firestoreOk = Read-Host "Đã tạo Firestore collections? (y/n)"
if ($firestoreOk -ne 'y' -and $firestoreOk -ne 'Y') {
    Write-Host "⚠️  Bạn cần tạo collections trước khi tiếp tục" -ForegroundColor Yellow
}

# 4. Update Config
Write-Host ""
Write-Host "⚙️ Step 4: Cập nhật Configuration" -ForegroundColor Yellow
Write-Host ""
Write-Host "Chỉnh sửa file: config/environment.ts" -ForegroundColor Gray
Write-Host "Thay đổi API_BASE_URL thành IP của máy backend của bạn"
Write-Host ""
Write-Host "Tìm IP của máy:" -ForegroundColor Gray
Write-Host "Mở PowerShell và gõ:" -ForegroundColor Gray
Write-Host "ipconfig"
Write-Host ""
Write-Host "Tìm dòng 'IPv4 Address' (thường bắt đầu với 192.168.x.x hoặc 10.x.x.x)"
Write-Host ""

$configOk = Read-Host "Đã cập nhật API_BASE_URL? (y/n)"

# 5. Show IP Address (optional)
Write-Host ""
$showIp = Read-Host "Bạn muốn xem IP của máy này không? (y/n)"
if ($showIp -eq 'y' -o $showIp -eq 'Y') {
    Write-Host ""
    Write-Host "📡 IP Address của máy này:" -ForegroundColor Cyan
    ipconfig | Select-String -Pattern "IPv4 Address"
    Write-Host ""
}

# 6. Run Frontend
Write-Host ""
Write-Host "📱 Step 5: Chạy Frontend" -ForegroundColor Yellow
Write-Host "Chạy lệnh này trong PowerShell Terminal 2:" -ForegroundColor Gray
Write-Host "npx expo start" -ForegroundColor White -BackgroundColor Blue
Read-Host "Đã chạy frontend? (nhấn Enter để tiếp tục)"

# 7. Test Search
Write-Host ""
Write-Host "🧪 Step 6: Thử Nghiệm" -ForegroundColor Yellow
Write-Host ""
Write-Host "Trong app:" -ForegroundColor Gray
Write-Host "1. Mở Search Screen"
Write-Host "2. Click nút 'Firebase' để bật (nút sẽ chuyển thành 🔥 Firebase)"
Write-Host "3. Nhập từ khóa: 'hoa'"
Write-Host "4. Bấm Search"
Write-Host "5. Kết quả sẽ hiển thị từ Firestore"
Write-Host ""

$testOk = Read-Host "Tìm kiếm thành công? (y/n)"

# 8. Final Check
if ($testOk -eq 'y' -o $testOk -eq 'Y') {
    Write-Host ""
    Write-Host "✅ Setup hoàn tất thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📚 Tài liệu:" -ForegroundColor Cyan
    Write-Host "- FIREBASE_SEARCH_GUIDE.md - Hướng dẫn chi tiết"
    Write-Host "- SETUP_FIREBASE_SEARCH.md - Setup từ A-Z"
    Write-Host "- IMPLEMENTATION_SUMMARY.md - Tóm tắt code"
    Write-Host ""
    Write-Host "🎉 Bạn đã sẵn sàng sử dụng Firebase Search!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Có lỗi trong quá trình setup" -ForegroundColor Red
    Write-Host "Vui lòng xem TROUBLESHOOTING trong SETUP_FIREBASE_SEARCH.md" -ForegroundColor Yellow
}

Read-Host "Nhấn Enter để kết thúc"
