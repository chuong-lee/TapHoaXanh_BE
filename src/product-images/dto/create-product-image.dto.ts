import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProductImageDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  productId!: number;
}
