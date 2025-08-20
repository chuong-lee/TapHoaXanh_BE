import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { SePayService } from './sepay.service';
import { VNPayService } from './vnpay.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [OrderController],
  providers: [OrderService, SePayService, VNPayService],
  exports: [OrderService, SePayService, VNPayService],
})
export class OrderModule {}
