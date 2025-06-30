// dto/create-cart.dto.ts
import { IsNumber } from 'class-validator';

export class CreateCartDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  productId: number;

  @IsNumber()
  quantity!: number;
}
