import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({
    description: 'Rating value from 1 to 5',
    example: 5,
    minimum: 1,
    maximum: 5
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({
    description: 'Comment for the rating',
    example: 'Sản phẩm rất tốt, giao hàng nhanh!',
    required: false
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: 'Product ID to rate',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  product_id!: number;

  @ApiProperty({
    description: 'User ID who is rating',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  user_id!: number;
}
