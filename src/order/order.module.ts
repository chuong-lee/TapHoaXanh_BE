import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/payment/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Payment])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
