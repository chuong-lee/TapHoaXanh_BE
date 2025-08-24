import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './category/categories.module';
import { DatabaseModule } from './database/database.module';
import { ProductVariantModule } from './product-variant/product-variant.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { BrandModule } from './brand/brand.module';
import { UsersModule } from './users/users.module';
import { AddressModule } from './address/address.module';
import { VoucherModule } from './voucher/voucher.module';
import { OrderModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OrderItemModule } from './order_item/order_item.module';
import { RatingModule } from './rating/rating.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CartModule } from './cart/cart.module';
import { CartItemModule } from './cart_item/cart_item.module';
import { NewsModule } from './news/news.module';


@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    DatabaseModule,
    ProductVariantModule,
    ProductImagesModule,
    BrandModule,
    UsersModule,
    AddressModule,
    VoucherModule,
    OrderModule,
    OrderItemModule,
    RatingModule,
    WishlistModule,
    CartModule,
    CartItemModule,
    NewsModule,

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
