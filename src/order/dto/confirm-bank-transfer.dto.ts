import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '../enums/payment-status.enum';

export class ConfirmBankTransferDto {
  @IsNumber()
  @IsNotEmpty()
  paymentId?: number; // This is actually orderId now

  @IsString()
  @IsNotEmpty()
  transactionId?: string;

  @IsString()
  @IsOptional()
  transactionImage?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;
}
