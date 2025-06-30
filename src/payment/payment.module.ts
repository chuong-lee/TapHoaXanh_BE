// payment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { PaymentLog } from './entities/payment-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentLog])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
