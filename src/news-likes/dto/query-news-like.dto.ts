import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryNewsLikeDto {
  @ApiPropertyOptional({ description: 'ID của người dùng', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  user_id?: number;

  @ApiPropertyOptional({ description: 'ID của bài viết', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  news_id?: number;

  @ApiPropertyOptional({ description: 'Số trang', example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Số lượng mỗi trang', example: 10, default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: 'Thời gian bắt đầu', example: '2023-01-01' })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({ description: 'Thời gian kết thúc', example: '2023-12-31' })
  @IsOptional()
  @IsDateString()
  to_date?: string;
}
