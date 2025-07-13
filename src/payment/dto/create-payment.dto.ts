import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsUUID } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsOptional()
  @IsString()
  order_id?: string;

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  stripeChargeId?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  paid_at?: string;

  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @IsDateString()
  updatedAt?: string;

  @IsOptional()
  @IsDateString()
  deletedAt?: string | null;

  @IsOptional()
  @IsUUID()
  id?: string;
}
