# Hướng Dẫn Login & Register

## ⚠️ Firebase Account Locked

Nếu bạn thấy lỗi `TOO_MANY_ATTEMPTS_TRY_LATER`, tài khoản của bạn bị lock. Chờ 15-30 phút hoặc:

### Cách 1: Tạo Tài Khoản Mới (Nhanh nhất)
1. Bấm "Đăng Ký" trên màn hình Login
2. Nhập:
   - Tên: Bất kỳ (ví dụ: "Nguyễn Văn A")
   - Email: Một email mới (ví dụ: `test123@gmail.com`)
   - Password: `test123456` (tối thiểu 6 ký tự)
3. Bấm "Tạo Tài Khoản"
4. Đăng nhập với email + password vừa tạo

### Cách 2: Setup Backend (Recommended)
Backend endpoint cho phép tạo tài khoản nhanh chóng mà không bị rate-limit:

```bash
cd backend
npm install
node resetPassword.js
```

Các endpoint backend:
- `POST /api/createTestUser` - Tạo tài khoản mới
- `POST /api/resetPassword` - Reset mật khẩu
- `POST /api/checkUser` - Check email tồn tại
- `GET /health` - Check server status

### Cách 3: Firebase Console
1. Vào Firebase Console → Authentication
2. Click "Add user"
3. Nhập email + password
4. Đăng nhập với thông tin đó

## 🔓 Reset Firebase Account Lock

1. Vào Firebase Console → Project Settings → App Verification
2. Bỏ chọn "Enable reCAPTCHA"
3. Hoặc chờ 15-30 phút để tự unlock

## 📝 Test Tài Khoản Mặc Định

Nếu backend không chạy, dùng Firebase REST API để tạo account rồi đăng nhập:

- Email: `youremail@gmail.com`
- Password: `password123` (tối thiểu 6 ký tự)

## 🐛 Troubleshooting

| Lỗi | Nguyên Nhân | Cách Fix |
|-----|-----------|---------|
| `TOO_MANY_ATTEMPTS_TRY_LATER` | Quá nhiều lần thử đăng nhập sai | Chờ 15-30 phút hoặc tạo email mới |
| `EMAIL_NOT_FOUND` | Email chưa được đăng ký | Đăng ký tài khoản mới |
| `INVALID_PASSWORD` | Mật khẩu sai | Kiểm tra lại mật khẩu hoặc dùng "Quên Mật Khẩu" |
| `EMAIL_EXISTS` | Email đã được đăng ký | Dùng email khác hoặc đăng nhập với email đó |
| Backend connection error | Backend không chạy | Chạy `node resetPassword.js` trong `backend/` folder |

## 🚀 Production Deployment

Khi deploy production:
1. Thay `BACKEND_URL = 'http://localhost:3000'` bằng URL thực
2. Deploy backend lên Heroku, Firebase Cloud Functions, AWS, v.v.
3. Thêm rate limiting + CORS validation trên backend
4. Lưu `serviceAccountKey.json` trong environment variables, không commit vào git
