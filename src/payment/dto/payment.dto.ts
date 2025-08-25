import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @Type(() => Number)
  orderId!: number;
}
