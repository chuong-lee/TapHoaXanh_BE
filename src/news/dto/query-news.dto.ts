import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class QueryNewsDto {
  @ApiProperty({ description: 'Trang hiện tại', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Số lượng bài viết trên mỗi trang', example: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ description: 'Từ khóa tìm kiếm', example: 'tin tức', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Loại bài viết', example: 'news', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'ID danh mục', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  category_id?: number;

  @ApiProperty({ description: 'ID tác giả', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  author_id?: number;
}
