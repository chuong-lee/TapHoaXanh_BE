# VNPay Integration - TapHoaXanh Backend

## Tổng quan

Tích hợp VNPay thanh toán online cho hệ thống TapHoaXanh, hoàn toàn tương thích với demo chính thức của VNPay.

## Tính năng

✅ **Tạo thanh toán VNPay** - Tạo URL thanh toán và redirect khách hàng  
✅ **Xử lý Return URL** - Nhận callback từ VNPay sau khi thanh toán  
✅ **Xử lý IPN** - Instant Payment Notification để cập nhật trạng thái real-time  
✅ **Truy vấn giao dịch** - Kiểm tra trạng thái giao dịch từ VNPay  
✅ **Hoàn tiền** - Hỗ trợ hoàn tiền toàn phần và một phần  
✅ **Hash Verification** - Bảo mật với SHA512 hash verification  
✅ **Logging** - Log đầy đủ các giao dịch để audit  
✅ **Error Handling** - Xử lý đầy đủ các trường hợp lỗi  

## Cài đặt

### 1. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
# VNPAY Configuration
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
VNPAY_RETURN_URL=http://localhost:3000/order/payment/vnpay/return
VNPAY_IPN_URL=http://localhost:3000/order/payment/vnpay/ipn
```

### 2. Production Configuration

Khi triển khai production:

```env
VNPAY_URL=https://pay.vnpay.vn/vpcpay.html
VNPAY_API=https://pay.vnpayment.vn/merchant_webapi/api/transaction
```

## API Endpoints

### 1. Tạo thanh toán VNPay

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

**Response:**
```json
{
  "status": "success",
  "data": {
    "order_id": 123,
    "transaction_id": "1512345678",
    "amount": 100000,
    "currency": "VND",
    "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "status": "pending",
    "bank_code": "VNPAYQR",
    "locale": "vn"
  }
}
```

### 2. Kiểm tra trạng thái thanh toán

```http
GET /order/payment/vnpay/{orderId}/status
```

### 3. Truy vấn giao dịch

```http
POST /order/payment/vnpay/query
Content-Type: application/json

{
  "orderId": "1512345678",
  "transDate": "20231201120000"
}
```

### 4. Hoàn tiền giao dịch

```http
POST /order/payment/vnpay/refund
Content-Type: application/json

{
  "orderId": "1512345678",
  "transDate": "20231201120000",
  "amount": 100000,
  "transType": "02",
  "user": "admin"
}
```

### 5. Return URL Callback

```http
GET /order/payment/vnpay/return?vnp_ResponseCode=00&vnp_TxnRef=1512345678&...
```

### 6. IPN Callback

```http
POST /order/payment/vnpay/ipn
Content-Type: application/x-www-form-urlencoded

vnp_ResponseCode=00&vnp_TxnRef=1512345678&...
```

## Mã ngân hàng hỗ trợ

- `VNPAYQR`: Thanh toán qua ứng dụng hỗ trợ VNPAYQR
- `VNBANK`: Thanh toán qua ATM-Tài khoản ngân hàng nội địa
- `INTCARD`: Thanh toán qua thẻ quốc tế
- ``: Để trống để hiển thị tất cả ngân hàng

## Mã lỗi VNPay

| Mã | Mô tả |
|----|-------|
| `00` | Giao dịch thành công |
| `01` | Giao dịch chưa hoàn tất |
| `02` | Giao dịch bị lỗi |
| `04` | Giao dịch đảo (Khách hàng đã hủy) |
| `05` | Giao dịch bị từ chối bởi VNPAY |
| `06` | Giao dịch bị hủy bởi VNPAY |
| `07` | Giao dịch bị từ chối bởi ngân hàng |
| `09` | Giao dịch bị từ chối (Nghi ngờ gian lận) |
| `13` | Giao dịch bị từ chối (Sai thông tin thanh toán) |
| `65` | Giao dịch bị giới hạn |
| `75` | Ngân hàng thanh toán đang bảo trì |
| `79` | Khách hàng nhập sai mật khẩu quá số lần quy định |
| `99` | Các lỗi khác |

## Kiểu hoàn tiền

- `02`: Hoàn toàn phần
- `03`: Hoàn một phần

## Sử dụng với Frontend

### JavaScript Example

```javascript
// Tạo thanh toán
async function createVNPayPayment(orderId, amount, description, bankCode) {
  try {
    const response = await fetch('/order/payment/vnpay/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount,
        description,
        bankCode,
        locale: 'vn'
      })
    });

    const result = await response.json();
    
    if (result.status === 'success') {
      // Redirect to VNPay payment page
      window.location.href = result.data.payment_url;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Kiểm tra trạng thái
async function checkPaymentStatus(orderId) {
  try {
    const response = await fetch(`/order/payment/vnpay/${orderId}/status`);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### React Example

```jsx
import React, { useState } from 'react';

function VNPayPayment({ orderId, amount, description }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/order/payment/vnpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount,
          description,
          bankCode: 'VNPAYQR',
          locale: 'vn'
        })
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        window.location.href = result.data.payment_url;
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
    >
      {loading ? 'Đang xử lý...' : 'Thanh toán VNPay'}
    </button>
  );
}
```

## Testing

### 1. Test với cURL

```bash
# Tạo thanh toán
curl -X POST http://localhost:3000/order/payment/vnpay/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 123,
    "amount": 100000,
    "description": "Test payment",
    "bankCode": "VNPAYQR",
    "locale": "vn"
  }'

# Kiểm tra trạng thái
curl -X GET http://localhost:3000/order/payment/vnpay/123/status
```

### 2. Test với Postman

Import collection từ file `VNPAY_TEST_EXAMPLES.md`

### 3. Test Sandbox

Sử dụng thông tin test từ VNPay:
- TMN Code: `2QXUI4J4`
- Hash Secret: `KATJWDUZFQKQZQKQZQKQZQKQZQKQZQKQZ`

## Lưu ý quan trọng

### 1. Bảo mật
- ✅ Luôn verify hash từ VNPay
- ✅ Sử dụng HTTPS trong production
- ✅ Bảo vệ IPN URL
- ✅ Log đầy đủ các giao dịch

### 2. Cấu hình
- ✅ Set timezone đúng (Asia/Ho_Chi_Minh)
- ✅ Cấu hình đúng Return URL và IPN URL
- ✅ Sử dụng đúng URL cho sandbox/production

### 3. Xử lý lỗi
- ✅ Xử lý đầy đủ các mã lỗi VNPay
- ✅ Retry mechanism cho IPN
- ✅ Fallback cho trường hợp IPN fail

### 4. Monitoring
- ✅ Monitor payment success rate
- ✅ Alert cho failed payments
- ✅ Log analysis cho fraud detection

## Troubleshooting

### Lỗi thường gặp

1. **Hash verification failed**
   - Kiểm tra VNPAY_HASH_SECRET
   - Đảm bảo tham số được sắp xếp đúng thứ tự

2. **IPN không nhận được**
   - Kiểm tra IPN URL có accessible từ internet
   - Kiểm tra firewall settings

3. **Return URL không hoạt động**
   - Kiểm tra URL format
   - Đảm bảo không có redirect loop

4. **Timezone issues**
   - Set `process.env.TZ = 'Asia/Ho_Chi_Minh'`
   - Kiểm tra server timezone

## Support

- VNPay Documentation: https://sandbox.vnpayment.vn/apis/
- VNPay Support: support@vnpayment.vn
- Demo Code: `vnpay_nodejs/` folder

## Changelog

### v1.0.0 (2023-12-01)
- ✅ Tích hợp VNPay hoàn chỉnh
- ✅ Hỗ trợ tất cả tính năng chính
- ✅ Tương thích với demo chính thức
- ✅ Documentation đầy đủ
