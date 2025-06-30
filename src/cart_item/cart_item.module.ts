import { Module } from '@nestjs/common';
import { CartItemService } from './cart_item.service';
import { CartItemController } from './cart_item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart_item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem])], // Specify the entities related to CartItem here
  controllers: [CartItemController],
  providers: [CartItemService],
})
export class CartItemModule {}
