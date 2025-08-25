import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 500000, description: 'Tổng giá đơn hàng' })
  @IsNumber()
  @IsNotEmpty()
  total_price!: number;

  @ApiPropertyOptional({ example: 'Giao trong giờ hành chính', description: 'Ghi chú đơn hàng' })
  @IsString()
  @IsOptional()
  note!: string;

  @ApiProperty({ example: 'ORD123456', description: 'Mã đơn hàng' })
  @IsString()
  @IsNotEmpty()
  order_code!: string;

  @ApiProperty({ example: 'PENDING', description: 'Trạng thái đơn hàng' })
  @IsString()
  @IsNotEmpty()
  status?: string;

  @ApiProperty({ example: 1, description: 'ID của user đặt hàng' })
  @IsNumber()
  @IsNotEmpty()
  userId!: number;
}
