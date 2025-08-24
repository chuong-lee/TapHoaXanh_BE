# VNPay Integration Test Examples

## 1. Test tạo thanh toán VNPay

### Request
```bash
curl -X POST http://localhost:3000/order/payment/vnpay/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 123,
    "amount": 100000,
    "description": "Thanh toán đơn hàng #123",
    "bankCode": "VNPAYQR",
    "locale": "vn"
  }'
```

### Response
```json
{
  "status": "success",
  "data": {
    "order_id": 123,
    "transaction_id": "1512345678",
    "amount": 100000,
    "currency": "VND",
    "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=10000000&vnp_Command=pay&vnp_CreateDate=20231201120000&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh%20toan%20cho%20ma%20GD%3A1512345678&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Forder%2Fpayment%2Fvnpay%2Freturn&vnp_TmnCode=2QXUI4J4&vnp_TxnRef=1512345678&vnp_Version=2.1.0&vnp_SecureHash=abc123...",
    "status": "pending",
    "bank_code": "VNPAYQR",
    "locale": "vn"
  }
}
```

## 2. Test kiểm tra trạng thái thanh toán

### Request
```bash
curl -X GET http://localhost:3000/order/payment/vnpay/123/status
```

### Response
```json
{
  "status": "success",
  "data": {
    "order_id": 123,
    "transaction_id": "1512345678",
    "amount": 100000,
    "status": "success",
    "payment_method": "vnpay",
    "description": "Thanh toán đơn hàng #123",
    "gateway_response": {
      "payment_url": "...",
      "vnp_data": {...},
      "payment_data": {
        "vnp_ResponseCode": "00",
        "vnp_TransactionNo": "12345678",
        "vnp_Amount": "10000000",
        "return_data": {...}
      },
      "created_at": "2023-12-01T12:00:00.000Z",
      "updated_at": "2023-12-01T12:05:00.000Z"
    }
  }
}
```

## 3. Test truy vấn giao dịch

### Request
```bash
curl -X POST http://localhost:3000/order/payment/vnpay/query \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "1512345678",
    "transDate": "20231201120000"
  }'
```

### Response
```json
{
  "status": "success",
  "data": {
    "vnp_ResponseCode": "00",
    "vnp_Message": "Success",
    "vnp_TxnRef": "1512345678",
    "vnp_Amount": "10000000",
    "vnp_TransactionNo": "12345678",
    "vnp_TransactionDate": "20231201120000",
    "vnp_TransactionType": "01",
    "vnp_TransactionStatus": "00"
  }
}
```

## 4. Test hoàn tiền giao dịch

### Request
```bash
curl -X POST http://localhost:3000/order/payment/vnpay/refund \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "1512345678",
    "transDate": "20231201120000",
    "amount": 100000,
    "transType": "02",
    "user": "admin"
  }'
```

### Response
```json
{
  "status": "success",
  "data": {
    "vnp_ResponseCode": "00",
    "vnp_Message": "Success",
    "vnp_TxnRef": "1512345678",
    "vnp_Amount": "10000000",
    "vnp_TransactionNo": "87654321",
    "vnp_TransactionDate": "20231201130000",
    "vnp_TransactionType": "02"
  }
}
```

## 5. Test Return URL Callback

### URL được VNPay redirect về
```
GET http://localhost:3000/order/payment/vnpay/return?vnp_ResponseCode=00&vnp_TxnRef=1512345678&vnp_Amount=10000000&vnp_TransactionNo=12345678&vnp_BankCode=VNPAYQR&vnp_PayDate=20231201120000&vnp_SecureHash=abc123...
```

### Response
```json
{
  "status": "success",
  "message": "Thanh toán thành công",
  "code": "00",
  "data": {
    "order_id": 123,
    "transaction_id": "1512345678",
    "vnp_transaction_no": "12345678",
    "amount": 100000,
    "bank_code": "VNPAYQR",
    "pay_date": "20231201120000"
  }
}
```

## 6. Test IPN Callback

### Request từ VNPay
```bash
POST http://localhost:3000/order/payment/vnpay/ipn
Content-Type: application/x-www-form-urlencoded

vnp_ResponseCode=00&vnp_TxnRef=1512345678&vnp_Amount=10000000&vnp_TransactionNo=12345678&vnp_BankCode=VNPAYQR&vnp_PayDate=20231201120000&vnp_SecureHash=abc123...
```

### Response
```
OK
```

## 7. Test với Postman

### Collection JSON
```json
{
  "info": {
    "name": "VNPay Integration Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create VNPay Payment",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"orderId\": 123,\n  \"amount\": 100000,\n  \"description\": \"Thanh toán đơn hàng #123\",\n  \"bankCode\": \"VNPAYQR\",\n  \"locale\": \"vn\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/order/payment/vnpay/create",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["order", "payment", "vnpay", "create"]
        }
      }
    },
    {
      "name": "Check Payment Status",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/order/payment/vnpay/123/status",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["order", "payment", "vnpay", "123", "status"]
        }
      }
    },
    {
      "name": "Query Transaction",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"orderId\": \"1512345678\",\n  \"transDate\": \"20231201120000\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/order/payment/vnpay/query",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["order", "payment", "vnpay", "query"]
        }
      }
    },
    {
      "name": "Refund Transaction",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"orderId\": \"1512345678\",\n  \"transDate\": \"20231201120000\",\n  \"amount\": 100000,\n  \"transType\": \"02\",\n  \"user\": \"admin\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/order/payment/vnpay/refund",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["order", "payment", "vnpay", "refund"]
        }
      }
    }
  ]
}
```

## 8. Test với JavaScript/Frontend

### Tạo thanh toán
```javascript
async function createVNPayPayment(orderId, amount, description, bankCode) {
  try {
    const response = await fetch('/order/payment/vnpay/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    } else {
      console.error('Error creating payment:', result.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Sử dụng
createVNPayPayment(123, 100000, 'Thanh toán đơn hàng #123', 'VNPAYQR');
```

### Kiểm tra trạng thái
```javascript
async function checkPaymentStatus(orderId) {
  try {
    const response = await fetch(`/order/payment/vnpay/${orderId}/status`);
    const result = await response.json();
    
    if (result.status === 'success') {
      console.log('Payment status:', result.data.status);
      return result.data;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Sử dụng
checkPaymentStatus(123);
```

## 9. Lưu ý quan trọng

1. **Sandbox vs Production**: Đảm bảo sử dụng đúng URL và credentials
2. **IPN URL**: Phải accessible từ internet để VNPay có thể gọi
3. **Return URL**: URL mà khách hàng sẽ được redirect về sau khi thanh toán
4. **Hash Verification**: Luôn verify hash để đảm bảo an toàn
5. **Error Handling**: Xử lý đầy đủ các trường hợp lỗi
6. **Logging**: Log đầy đủ để debug và audit
7. **Timezone**: Đảm bảo timezone được set đúng (Asia/Ho_Chi_Minh)
