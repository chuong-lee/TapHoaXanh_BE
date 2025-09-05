import { ApiProperty } from '@nestjs/swagger';

export class RatingResponseDto {
  @ApiProperty({
    description: 'Rating ID',
    example: 1
  })
  id!: number;

  @ApiProperty({
    description: 'Rating value from 1 to 5',
    example: 5
  })
  rating!: number;

  @ApiProperty({
    description: 'Comment for the rating',
    example: 'Sản phẩm rất tốt, giao hàng nhanh!',
    required: false
  })
  comment?: string;

  @ApiProperty({
    description: 'Product ID',
    example: 1
  })
  product_id!: number;

  @ApiProperty({
    description: 'User ID',
    example: 1
  })
  user_id!: number;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com'
    }
  })
  user!: {
    id: number;
    username: string;
    email: string;
  };

  @ApiProperty({
    description: 'Product information',
    example: {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 25000000
    }
  })
  product!: {
    id: number;
    name: string;
    price: number;
  };

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-15T10:30:00Z'
  })
  updatedAt!: Date;
}
