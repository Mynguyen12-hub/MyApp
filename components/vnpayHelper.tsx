import CryptoJS from 'crypto-js';
import { format } from 'date-fns';

// 1. Cấu hình từ ảnh bạn gửi (Đã Trim loại bỏ dấu cách thừa)
const VNP_TMN_CODE = "ID4AMEAN".trim(); 
const VNP_HASH_SECRET = "04ZR8Q0TSNFRS65T0J6TEB8AEPX8AGEQ".trim(); 
const VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNP_RETURN_URL = "https://google.com";

export const createPaymentUrl = (amount: number): { url: string, signData: string, signed: string } => {
    const date = new Date();
    // Tạo mã đơn hàng ngẫu nhiên
    const orderId = format(date, "ddHHmmss") + Math.floor(Math.random() * 1000);
    const createDate = format(date, "yyyyMMddHHmmss");

    // 2. Cấu hình tham số
    const vnp_Params: any = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: VNP_TMN_CODE,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh_toan_don_hang_${orderId}`,
        vnp_OrderType: 'other',
        vnp_Amount: Math.floor(amount * 100),
        vnp_ReturnUrl: VNP_RETURN_URL,
        vnp_IpAddr: '127.0.0.1',
        vnp_CreateDate: createDate,
    };

    // 3. Sắp xếp tham số (Quan trọng)
    const sortedParams = sortObject(vnp_Params);

    // 4. Encode dữ liệu trước khi Hash
    const signData = Object.keys(sortedParams)
        .map(key => {
            return `${key}=${encodeURIComponent(sortedParams[key])}`;
        })
        .join('&');

    // 5. Tạo chữ ký (HMAC SHA512)
    const hmac = CryptoJS.HmacSHA512(signData, VNP_HASH_SECRET);
    const signed = hmac.toString(CryptoJS.enc.Hex);

    // 6. Gán chữ ký vào tham số
    sortedParams['vnp_SecureHash'] = signed;

    // 7. Tạo URL cuối cùng
    const finalQueryString = Object.keys(sortedParams)
        .map(key => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key])}`;
        })
        .join('&');

    return {
        url: `${VNP_URL}?${finalQueryString}`,
        signData,
        signed
    };
};

// Hàm sắp xếp object
const sortObject = (obj: any): any => {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
        sorted[key] = obj[key];
    });
    return sorted;
};