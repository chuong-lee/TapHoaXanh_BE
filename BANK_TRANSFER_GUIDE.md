# Hướng dẫn tích hợp thanh toán chuyển khoản

## Tổng quan

Hệ thống hiện hỗ trợ 3 phương thức thanh toán:
- **MoMo**: Thanh toán qua ví điện tử MoMo
- **VNPay**: Thanh toán qua cổng VNPay
- **Bank Transfer**: Chuyển khoản ngân hàng (mới)

## Thanh toán chuyển khoản

### 1. Cấu hình thông tin ngân hàng

Thêm các biến sau vào file `.env`:

```env
BANK_NAME=Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)
BANK_ACCOUNT_NUMBER=1234567890
BANK_ACCOUNT_NAME=NGUYEN VAN A
```

### 2. API Endpoints

#### Tạo thanh toán chuyển khoản

```http
POST /order/payment/charge
Content-Type: application/json

{
  "amount": 100000,
  "currency": "VND",
  "source": "order_123",
  "description": "Thanh toán đơn hàng #123",
  "payment_method": "bank_transfer"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "bankTransferInfo": {
      "bankName": "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
      "accountNumber": "1234567890",
      "accountName": "NGUYEN VAN A",
      "qrCode": "https://img.vietqr.io/image/970436-1234567890-compact2.jpg?amount=100000&addInfo=TapHoaXanh%2012%20Thanh%20toan%20don%20hang",
      "amount": 100000,
      "transferContent": "TapHoaXanh 12 Thanh toan don hang #123",
      "note": "Vui lòng chuyển khoản đúng nội dung: \"TapHoaXanh 12 Thanh toan don hang #123\" để được xử lý tự động"
    },
    "paymentMethod": "bank_transfer",
    "status": "pending",
    "message": "Vui lòng thực hiện chuyển khoản theo thông tin bên dưới"
  }
}
```

#### Xác nhận thanh toán chuyển khoản

```http
POST /order/payment/confirm-bank-transfer
Content-Type: application/json

{
  "paymentId": 12,
  "transactionId": "FT24030712345678",
  "transactionImage": "base64_image_or_url",
  "note": "Đã chuyển khoản thành công",
  "status": "success"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 12,
    "amount": 100000,
    "currency": "VND",
    "payment_method": "bank_transfer",
    "payment_status": "success"
  },
  "message": "Bank transfer confirmed successfully"
}
```

### 3. Tích hợp Frontend

#### Hiển thị thông tin chuyển khoản

```javascript
// Gọi API tạo thanh toán
const response = await fetch('/order/payment/charge', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 100000,
    currency: 'VND',
    source: 'order_123',
    description: 'Thanh toán đơn hàng #123',
    payment_method: 'bank_transfer'
  })
});

const data = await response.json();

if (data.status === 'success' && data.data.bankTransferInfo) {
  const bankInfo = data.data.bankTransferInfo;
  
  // Hiển thị thông tin chuyển khoản
  displayBankTransferInfo({
    bankName: bankInfo.bankName,
    accountNumber: bankInfo.accountNumber,
    accountName: bankInfo.accountName,
    amount: bankInfo.amount,
    transferContent: bankInfo.transferContent,
    qrCode: bankInfo.qrCode,
    note: bankInfo.note
  });
}
```

#### UI Components gợi ý

```html
<div class="bank-transfer-info">
  <h3>Thông tin chuyển khoản</h3>
  
  <div class="bank-details">
    <p><strong>Ngân hàng:</strong> {{bankName}}</p>
    <p><strong>Số tài khoản:</strong> 
      <span class="account-number">{{accountNumber}}</span>
      <button onclick="copyToClipboard('{{accountNumber}}')">📋</button>
    </p>
    <p><strong>Tên tài khoản:</strong> {{accountName}}</p>
    <p><strong>Số tiền:</strong> 
      <span class="amount">{{amount | currency}}</span>
      <button onclick="copyToClipboard('{{amount}}')">📋</button>
    </p>
    <p><strong>Nội dung chuyển khoản:</strong> 
      <span class="transfer-content">{{transferContent}}</span>
      <button onclick="copyToClipboard('{{transferContent}}')">📋</button>
    </p>
  </div>
  
  <div class="qr-code">
    <h4>Quét mã QR để chuyển khoản</h4>
    <img src="{{qrCode}}" alt="QR Code" />
  </div>
  
  <div class="note">
    <p><em>{{note}}</em></p>
  </div>
  
  <div class="confirm-section">
    <h4>Xác nhận thanh toán</h4>
    <input type="text" placeholder="Mã giao dịch" id="transactionId">
    <input type="file" accept="image/*" id="transactionImage">
    <button onclick="confirmPayment()">Xác nhận đã chuyển khoản</button>
  </div>
</div>
```

### 4. Features

- ✅ Tự động tạo QR code VietQR
- ✅ Copy thông tin chuyển khoản
- ✅ Xác nhận thanh toán bằng mã giao dịch
- ✅ Upload ảnh chứng minh chuyển khoản
- ✅ Log đầy đủ các giao dịch
- ✅ Hỗ trợ các ngân hàng Việt Nam thông qua VietQR

### 5. Customization

Để thay đổi ngân hàng, cập nhật:
1. `BANK_ACCOUNT_NUMBER`, `BANK_ACCOUNT_NAME` trong `.env`
2. Mã ngân hàng trong method `generateQRCode()` (hiện tại là Vietcombank - 970436)

Danh sách mã ngân hàng phổ biến:
- Vietcombank: 970436
- Techcombank: 970407  
- VietinBank: 970415
- BIDV: 970418
- ACB: 970416
- Sacombank: 970403
