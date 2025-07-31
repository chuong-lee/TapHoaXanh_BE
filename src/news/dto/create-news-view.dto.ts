import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString } from 'class-validator';

export class CreateNewsViewDto {
  @ApiProperty({ description: 'ID của người dùng', example: 1 })
  @IsNumber()
  user_id: number;

  @ApiProperty({ description: 'ID của bài viết', example: 1 })
  @IsNumber()
  news_id: number;
}
