// payment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { Order } from 'src/order/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentLog, Order])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
