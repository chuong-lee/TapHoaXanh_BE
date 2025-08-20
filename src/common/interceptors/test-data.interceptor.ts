import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, catchError, of } from 'rxjs';

@Injectable()
export class TestDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const isTestMode = process.env.API_TEST_MODE === 'true';

    return next.handle().pipe(
      catchError((error) => {
        if (isTestMode) {
          console.log('API Error detected, returning test data for:', request.url);
          
          // Trả về dữ liệu test dựa trên endpoint
          if (request.url.includes('/products')) {
            return of(this.getTestProducts());
          } else if (request.url.includes('/cart')) {
            return of(this.getTestCartItems());
          } else if (request.url.includes('/wishlist')) {
            return of(this.getTestWishlist());
          } else if (request.url.includes('/voucher')) {
            return of(this.getTestVouchers());
          } else if (request.url.includes('/order')) {
            return of(this.getTestOrders());
          }
          
          // Fallback: trả về array rỗng cho các endpoint khác
          return of([]);
        }
        
        // Nếu không phải test mode, throw lỗi như bình thường
        throw error;
      }),
    );
  }

  private getTestProducts() {
    return [
      {
        id: 1,
        name: 'Sản phẩm test 1',
        price: 25000,
        discount: 10,
        images: 'https://via.placeholder.com/300x300?text=Test+Product+1',
        slug: 'san-pham-test-1',
        barcode: 'TEST001',
        description: 'Sản phẩm test mẫu số 1',
        quantity: 100,
      },
      {
        id: 2,
        name: 'Sản phẩm test 2',
        price: 35000,
        discount: 15,
        images: 'https://via.placeholder.com/300x300?text=Test+Product+2',
        slug: 'san-pham-test-2',
        barcode: 'TEST002',
        description: 'Sản phẩm test mẫu số 2',
        quantity: 80,
      },
      {
        id: 3,
        name: 'Sản phẩm test 3',
        price: 45000,
        discount: 20,
        images: 'https://via.placeholder.com/300x300?text=Test+Product+3',
        slug: 'san-pham-test-3',
        barcode: 'TEST003',
        description: 'Sản phẩm test mẫu số 3',
        quantity: 120,
      },
      {
        id: 4,
        name: 'Sản phẩm test 4',
        price: 55000,
        discount: 25,
        images: 'https://via.placeholder.com/300x300?text=Test+Product+4',
        slug: 'san-pham-test-4',
        barcode: 'TEST004',
        description: 'Sản phẩm test mẫu số 4',
        quantity: 90,
      },
      {
        id: 5,
        name: 'Sản phẩm test 5',
        price: 65000,
        discount: 30,
        images: 'https://via.placeholder.com/300x300?text=Test+Product+5',
        slug: 'san-pham-test-5',
        barcode: 'TEST005',
        description: 'Sản phẩm test mẫu số 5',
        quantity: 110,
      },
    ];
  }

  private getTestCartItems() {
    return [
      {
        id: 1,
        quantity: 2,
        product: {
          id: 1,
          name: 'Sản phẩm test trong giỏ hàng 1',
          price: 25000,
          images: 'https://via.placeholder.com/300x300?text=Cart+Product+1',
        },
      },
      {
        id: 2,
        quantity: 1,
        product: {
          id: 2,
          name: 'Sản phẩm test trong giỏ hàng 2',
          price: 35000,
          images: 'https://via.placeholder.com/300x300?text=Cart+Product+2',
        },
      },
      {
        id: 3,
        quantity: 3,
        product: {
          id: 3,
          name: 'Sản phẩm test trong giỏ hàng 3',
          price: 45000,
          images: 'https://via.placeholder.com/300x300?text=Cart+Product+3',
        },
      },
    ];
  }

  private getTestWishlist() {
    return [
      {
        id: 1,
        product: {
          id: 1,
          name: 'Sản phẩm yêu thích 1',
          price: 25000,
          images: 'https://via.placeholder.com/300x300?text=Wishlist+Product+1',
        },
      },
      {
        id: 2,
        product: {
          id: 2,
          name: 'Sản phẩm yêu thích 2',
          price: 35000,
          images: 'https://via.placeholder.com/300x300?text=Wishlist+Product+2',
        },
      },
    ];
  }

  private getTestVouchers() {
    return [
      {
        id: 1,
        code: 'DISCOUNT10',
        discount_value: 10000,
        max_discount: 50000,
        min_order_value: 100000,
        description: 'Giảm giá 10k cho đơn hàng từ 100k',
        is_active: true,
      },
      {
        id: 2,
        code: 'FREESHIP',
        discount_value: 0,
        max_discount: 30000,
        min_order_value: 200000,
        description: 'Miễn phí ship cho đơn hàng từ 200k',
        is_active: true,
      },
    ];
  }

  private getTestOrders() {
    return [
      {
        id: 1,
        price: 125000,
        quantity: 3,
        payment_status: 'PENDING',
        payment_method: 'MOMO',
        createdAt: new Date(),
      },
      {
        id: 2,
        price: 85000,
        quantity: 2,
        payment_status: 'COMPLETED',
        payment_method: 'VNPAY',
        createdAt: new Date(),
      },
    ];
  }
}
