import { ApiProperty } from '@nestjs/swagger';
import { NewsLikes } from '../entities/news-likes.entity';

export class PaginatedNewsLikeDto {
  @ApiProperty({ description: 'Danh sách lượt thích', type: [NewsLikes] })
  data: NewsLikes[];

  @ApiProperty({ description: 'Tổng số lượt thích', example: 100 })
  total: number;

  @ApiProperty({ description: 'Trang hiện tại', example: 1 })
  page: number;

  @ApiProperty({ description: 'Số lượng mỗi trang', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Tổng số trang', example: 10 })
  totalPages: number;
}
