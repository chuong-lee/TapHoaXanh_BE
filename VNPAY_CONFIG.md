# Hướng dẫn cấu hình VNPay

## 1. Cấu hình Environment Variables

Thêm các biến môi trường sau vào file `.env`:

```env
# VNPAY Configuration
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
VNPAY_RETURN_URL=http://localhost:3000/order/payment/vnpay/return
VNPAY_IPN_URL=http://localhost:3000/order/payment/vnpay/ipn
```

## 2. Cấu hình Production

Khi triển khai production, thay đổi URLs:

```env
VNPAY_URL=https://pay.vnpay.vn/vpcpay.html
VNPAY_API=https://pay.vnpayment.vn/merchant_webapi/api/transaction
```

## 3. Các API Endpoints

### Tạo thanh toán VNPay
```http
POST /order/payment/vnpay/create
Content-Type: application/json

{
  "orderId": 123,
  "amount": 100000,
  "description": "Thanh toán đơn hàng #123",
  "bankCode": "VNPAYQR",
  "locale": "vn"
}
```

### Kiểm tra trạng thái thanh toán
```http
GET /order/payment/vnpay/123/status
```

### Truy vấn giao dịch
```http
POST /order/payment/vnpay/query
Content-Type: application/json

{
  "orderId": "123456789",
  "transDate": "20231201120000"
}
```

### Hoàn tiền giao dịch
```http
POST /order/payment/vnpay/refund
Content-Type: application/json

{
  "orderId": "123456789",
  "transDate": "20231201120000",
  "amount": 100000,
  "transType": "02",
  "user": "admin"
}
```

## 4. Callback URLs

### Return URL (Redirect sau khi thanh toán)
```
GET /order/payment/vnpay/return?vnp_ResponseCode=00&vnp_TxnRef=123456789&...
```

### IPN URL (Instant Payment Notification)
```
POST /order/payment/vnpay/ipn
```

## 5. Mã ngân hàng hỗ trợ

- `VNPAYQR`: Thanh toán qua ứng dụng hỗ trợ VNPAYQR
- `VNBANK`: Thanh toán qua ATM-Tài khoản ngân hàng nội địa
- `INTCARD`: Thanh toán qua thẻ quốc tế
- ``: Để trống để hiển thị tất cả ngân hàng

## 6. Mã lỗi VNPay

- `00`: Giao dịch thành công
- `01`: Giao dịch chưa hoàn tất
- `02`: Giao dịch bị lỗi
- `04`: Giao dịch đảo (Khách hàng đã hủy giao dịch)
- `05`: Giao dịch bị từ chối bởi VNPAY
- `06`: Giao dịch bị hủy bởi VNPAY
- `07`: Giao dịch bị từ chối bởi ngân hàng
- `09`: Giao dịch bị từ chối (Giao dịch bị nghi ngờ gian lận)
- `13`: Giao dịch bị từ chối (Sai thông tin thanh toán)
- `65`: Giao dịch bị giới hạn
- `75`: Ngân hàng thanh toán đang bảo trì
- `79`: Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định
- `99`: Các lỗi khác

## 7. Kiểu hoàn tiền

- `02`: Hoàn toàn phần
- `03`: Hoàn một phần

## 8. Lưu ý quan trọng

1. **Sandbox vs Production**: Đảm bảo sử dụng đúng URL cho môi trường tương ứng
2. **Hash Verification**: Luôn verify hash từ VNPAY để đảm bảo an toàn
3. **IPN Handling**: Xử lý IPN để cập nhật trạng thái thanh toán real-time
4. **Error Handling**: Xử lý đầy đủ các trường hợp lỗi
5. **Logging**: Log đầy đủ các giao dịch để debug và audit
