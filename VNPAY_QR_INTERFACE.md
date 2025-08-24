# VNPay QR Code Interface - Giao diện quét mã thanh toán

## 1. Backend - Thêm API endpoint

```typescript
// src/order/order.controller.ts
@Get('payment/vnpay/:orderId/qr')
async getVNPayQRCode(@Param('orderId', ParseIntPipe) orderId: number) {
  const qrData = await this.vnpayService.generateQRCode(orderId);
  return { status: 'success', data: qrData };
}
```

```typescript
// src/order/vnpay.service.ts
async generateQRCode(orderId: number): Promise<any> {
  const order = await this.orderRepository.findOne({ where: { id: orderId } });
  if (!order) throw new BadRequestException('Order not found');
  
  const paymentData = await this.createPaymentUrl(orderId, order.payment_amount, order.payment_description);
  
  return {
    order_id: orderId,
    amount: order.payment_amount,
    payment_url: paymentData.payment_url,
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentData.payment_url)}`,
    transaction_id: paymentData.transaction_id,
    status: 'pending'
  };
}
```

## 2. Frontend React Component

```jsx
// components/VNPayQRCode.jsx
import React, { useState, useEffect } from 'react';

const VNPayQRCode = ({ orderId, amount, description }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  useEffect(() => {
    fetchQRCode();
  }, [orderId]);

  const fetchQRCode = async () => {
    try {
      const response = await fetch(`/order/payment/vnpay/${orderId}/qr`);
      const result = await response.json();
      if (result.status === 'success') {
        setQrData(result.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/order/payment/vnpay/${orderId}/status`);
      const result = await response.json();
      if (result.status === 'success') {
        setPaymentStatus(result.data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (qrData && paymentStatus === 'pending') {
      const interval = setInterval(checkPaymentStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [qrData, paymentStatus]);

  if (loading) {
    return <div>Đang tạo mã QR...</div>;
  }

  if (paymentStatus === 'success') {
    return (
      <div className="success">
        <h3>✅ Thanh toán thành công!</h3>
        <p>Đơn hàng #{orderId} đã được thanh toán</p>
      </div>
    );
  }

  return (
    <div className="vnpay-qr-container">
      <h2>Thanh toán VNPay</h2>
      
      <div className="order-info">
        <p>Mã đơn hàng: #{orderId}</p>
        <p>Số tiền: {amount?.toLocaleString('vi-VN')} VNĐ</p>
        <p>Mô tả: {description}</p>
      </div>

      <div className="qr-code">
        <img 
          src={qrData?.qr_code_url} 
          alt="VNPay QR Code"
          style={{ width: '200px', height: '200px' }}
        />
      </div>

      <div className="instructions">
        <h4>Hướng dẫn thanh toán:</h4>
        <ol>
          <li>Mở ứng dụng VNPay</li>
          <li>Chọn "Quét mã QR"</li>
          <li>Quét mã QR bên trên</li>
          <li>Xác nhận và thanh toán</li>
        </ol>
      </div>

      <div className="payment-options">
        <button onClick={() => window.open(qrData?.payment_url, '_blank')}>
          Thanh toán trực tiếp
        </button>
      </div>

      <div className="status">
        Trạng thái: {paymentStatus === 'pending' ? 'Đang chờ thanh toán...' : paymentStatus}
      </div>
    </div>
  );
};

export default VNPayQRCode;
```

## 3. CSS Styling

```css
.vnpay-qr-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
}

.order-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
}

.qr-code {
  margin: 20px 0;
}

.qr-code img {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 8px;
}

.instructions {
  text-align: left;
  background: #e3f2fd;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
}

.instructions ol {
  margin: 0;
  padding-left: 20px;
}

.payment-options button {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  margin: 10px;
}

.status {
  margin-top: 20px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.success {
  text-align: center;
  padding: 40px;
  color: #28a745;
}
```

## 4. Sử dụng Component

```jsx
// pages/Checkout.jsx
import VNPayQRCode from '../components/VNPayQRCode';

const Checkout = () => {
  return (
    <div>
      <h1>Thanh toán đơn hàng</h1>
      <VNPayQRCode
        orderId={123}
        amount={100000}
        description="Thanh toán đơn hàng #123"
      />
    </div>
  );
};
```

## 5. Test API

```bash
# Lấy QR code
curl -X GET http://localhost:3000/order/payment/vnpay/123/qr

# Kiểm tra trạng thái
curl -X GET http://localhost:3000/order/payment/vnpay/123/status
```

Với setup này, người dùng có thể quét mã QR để thanh toán VNPay trực tiếp từ giao diện web! 🎯
