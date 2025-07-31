import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsDateString } from 'class-validator';

export class QueryNewsViewDto {
  @ApiProperty({ description: 'ID của người dùng', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiProperty({ description: 'ID của bài viết', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  news_id?: number;

  @ApiProperty({ description: 'Trang hiện tại', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: 'Số lượng bản ghi trên mỗi trang', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
