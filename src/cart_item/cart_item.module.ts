import { forwardRef, Module } from '@nestjs/common';
import CartItemController from './cart_item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart_item.entity';
import { CartItemRepositoryProvider, CartItemServiceProvider } from './cart_item.provider';
import { CartModule } from 'src/cart/cart.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem]), forwardRef(() => CartModule), forwardRef(() => ProductsModule)],
  controllers: [CartItemController],
  providers: [CartItemRepositoryProvider, CartItemServiceProvider],
  exports: [CartItemRepositoryProvider, CartItemServiceProvider],
})
export class CartItemModule {}
