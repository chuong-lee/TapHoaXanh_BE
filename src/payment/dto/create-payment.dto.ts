import { PaymentMethod } from '../enums/payment-method.enum';
import { IsEnum, IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

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
}
