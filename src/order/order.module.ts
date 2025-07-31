import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Order, PaymentLog])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
