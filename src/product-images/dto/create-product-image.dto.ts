import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProductImageDto {
  @IsNumber()
  @IsNotEmpty()
  productId!: number;
}
