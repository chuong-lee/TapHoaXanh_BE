import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { Voucher } from './entities/voucher.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../order/order.module';
import { VoucherRepository } from './voucher.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher]), OrderModule],
  controllers: [VoucherController],
  providers: [VoucherService, VoucherRepository],
  exports: [VoucherService, VoucherRepository],
})
export class VoucherModule {}
