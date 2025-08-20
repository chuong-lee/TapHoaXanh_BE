import { ApiProperty } from '@nestjs/swagger';
import { News } from '../entities/news.entity';

export class PaginatedNewsDto {
  @ApiProperty({ description: 'Danh sách bài viết', type: [News] })
  data: News[];

  @ApiProperty({ description: 'Tổng số bài viết', example: 100 })
  total: number;

  @ApiProperty({ description: 'Trang hiện tại', example: 1 })
  page: number;

  @ApiProperty({ description: 'Số lượng bài viết trên mỗi trang', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Tổng số trang', example: 10 })
  totalPages: number;

  @ApiProperty({ description: 'Có trang sau hay không', example: true })
  hasNext: boolean;

  @ApiProperty({ description: 'Có trang trước hay không', example: false })
  hasPrev: boolean;
}
