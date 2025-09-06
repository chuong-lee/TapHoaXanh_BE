import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({ description: 'ID của sản phẩm' })
  @IsNumber()
  productId!: number;

  @ApiProperty({ description: 'Tên biến thể' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Giá biến thể' })
  @IsNumber()
  price!: number;

  @ApiProperty({ description: 'Số lượng tồn kho', required: false })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ description: 'Mô tả biến thể', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

