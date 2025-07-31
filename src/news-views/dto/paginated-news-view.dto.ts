import { ApiProperty } from '@nestjs/swagger';
import { NewsViews } from '../entities/news-views.entity';

export class PaginatedNewsViewDto {
  @ApiProperty({ description: 'Dữ liệu lượt xem', type: [NewsViews] })
  data: NewsViews[];

  @ApiProperty({ description: 'Tổng số bản ghi', example: 100 })
  total: number;

  @ApiProperty({ description: 'Trang hiện tại', example: 1 })
  page: number;

  @ApiProperty({ description: 'Số bản ghi mỗi trang', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Tổng số trang', example: 10 })
  totalPages: number;
}
