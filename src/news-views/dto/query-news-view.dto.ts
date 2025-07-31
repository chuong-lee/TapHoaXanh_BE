import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsDateString, IsPositive, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryNewsViewDto {
  @ApiProperty({ description: 'ID của người dùng', example: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  user_id?: number;

  @ApiProperty({ description: 'ID của bài viết', example: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  news_id?: number;

  @ApiProperty({ description: 'Thời gian xem từ', example: '2025-07-01', required: false })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiProperty({ description: 'Thời gian xem đến', example: '2025-07-31', required: false })
  @IsOptional()
  @IsDateString()
  to_date?: string;

  @ApiProperty({ description: 'Số trang', example: 1, required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Số bản ghi mỗi trang', example: 10, required: false, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsPositive()
  limit?: number = 10;
}
