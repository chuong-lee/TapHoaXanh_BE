import { PartialType } from '@nestjs/swagger';
import { CreatePaymentDto } from './create-payment.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { PaymentStatus } from '../enums/payment-status.enum';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;
}
