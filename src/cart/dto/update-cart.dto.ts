import { PartialType } from '@nestjs/swagger';
import { CreateCartDto } from './create-cart.dto';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCartDto extends PartialType(CreateCartDto) {
  @IsInt()
  @IsOptional()
  productId?: number;

  @IsInt()
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  @IsOptional()
  quantity?: number;
}
