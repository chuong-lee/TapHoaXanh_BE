# TapHoaXanh Backend - API Test Mode

## Mô tả

Hệ thống backend đã được cấu hình để tự động trả về **5 sản phẩm test** khi API gặp lỗi hoặc không có dữ liệu, thay vì trả về mảng rỗng.

## Tính năng Test Mode

### Cấu hình

Trong file `.env`, đã thêm cấu hình:
```env
API_TEST_MODE=true
NODE_ENV=development
```

### Các API đã được cập nhật

1. **Products API** (`/products`)
   - GET `/products` - Trả về 5 sản phẩm test nếu không có dữ liệu
   - GET `/products/:id` - Trả về sản phẩm test nếu không tìm thấy
   - GET `/products/cate/:id` - Trả về 5 sản phẩm test nếu danh mục không tồn tại

2. **Cart API** (`/cart`)
   - GET `/cart/user/:userId` - Trả về 3 sản phẩm test trong giỏ hàng

3. **Wishlist API** (`/wishlist`)
   - GET `/wishlist` - Trả về 5 sản phẩm yêu thích test

4. **Voucher API** (`/voucher`)
   - GET `/voucher` - Trả về 5 voucher test

5. **Product Images API** (`/product-images`)
   - GET `/product-images` - Trả về 5 ảnh sản phẩm test

6. **Product Variants API** (`/product-variant`)
   - GET `/product-variant` - Trả về 5 variant test (Size S, M, L, XL, XXL)

7. **Cart Items API** (`/cart-item`)
   - GET `/cart-item` - Trả về 5 item test trong giỏ hàng

8. **Order Items API** (`/order-item`)
   - GET `/order-item` - Trả về 5 item test trong đơn hàng

### Dữ liệu Test Mẫu

#### Sản phẩm Test
```json
[
  {
    "id": 1,
    "name": "Sản phẩm test 1",
    "price": 25000,
    "discount": 10,
    "images": "https://via.placeholder.com/300x300?text=Test+Product+1",
    "slug": "san-pham-test-1",
    "barcode": "TEST001",
    "description": "Sản phẩm test mẫu số 1",
    "quantity": 100
  },
  // ... 4 sản phẩm khác
]
```

#### Voucher Test
```json
[
  {
    "id": 1,
    "code": "DISCOUNT10",
    "discount_value": 10000,
    "max_discount": 50000,
    "min_order_value": 100000,
    "description": "Giảm giá 10k cho đơn hàng từ 100k",
    "is_active": true
  },
  // ... 4 voucher khác
]
```

### Interceptor Toàn Cục

Đã tạo `TestDataInterceptor` để bắt lỗi toàn cục và tự động trả về dữ liệu test:

- Nếu `API_TEST_MODE=true`, khi có lỗi sẽ trả về dữ liệu test thay vì lỗi
- Dữ liệu test được tùy chỉnh theo từng endpoint
- Console sẽ log thông tin khi trả về dữ liệu test

### Try-Catch trong Service

Các service đã được bọc trong try-catch:

```typescript
async findAll() {
  try {
    const products = await this.productRepository.findAll();
    return products.length > 0 ? products : this.getTestProducts();
  } catch (error) {
    console.error('Error fetching products:', error);
    return this.getTestProducts();
  }
}
```

### Cách sử dụng

1. **Chế độ Development**: Set `API_TEST_MODE=true` để luôn có dữ liệu test khi lỗi
2. **Chế độ Production**: Set `API_TEST_MODE=false` để throw lỗi như bình thường

### Lợi ích

- **Frontend luôn có dữ liệu để hiển thị**, không bao giờ gặp mảng rỗng
- **Dễ dàng testing và development**
- **UX tốt hơn** khi demo cho khách hàng
- **Tương thích backward** - có thể tắt bất cứ lúc nào

### Chạy ứng dụng

```bash
# Development mode với test data
npm run start:dev

# Production mode 
npm run start:prod
```

### Testing APIs

Sau khi chạy server, có thể test các endpoint:

- GET `http://localhost:3000/products` - Luôn trả về ít nhất 5 sản phẩm
- GET `http://localhost:3000/cart/user/1` - Trả về giỏ hàng test nếu user không có sản phẩm nào
- GET `http://localhost:3000/wishlist` - Trả về danh sách yêu thích test
- GET `http://localhost:3000/voucher` - Trả về danh sách voucher test

### Ghi chú

- Tất cả ảnh test sử dụng placeholder từ `via.placeholder.com`
- Dữ liệu test được thiết kế để phù hợp với frontend
- Console sẽ log khi trả về dữ liệu test để dễ debug
