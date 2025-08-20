import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { PaginatedNewsDto } from './dto/paginated-news.dto';
import { News } from './entities/news.entity';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  @ApiResponse({ status: 201, description: 'Bài viết đã được tạo thành công', type: News })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  create(@Body() createNewsDto: CreateNewsDto): Promise<News> {
    return this.newsService.create(createNewsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả bài viết' })
  @ApiResponse({ status: 200, description: 'Danh sách tất cả bài viết', type: [News] })
  findAll(): Promise<News[]> {
    return this.newsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm bài viết với phân trang' })
  @ApiResponse({ status: 200, description: 'Kết quả tìm kiếm bài viết', type: PaginatedNewsDto })
  search(@Query() queryDto: QueryNewsDto): Promise<PaginatedNewsDto> {
    return this.newsService.findWithPagination(queryDto);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Lấy bài viết phổ biến' })
  @ApiQuery({ name: 'limit', description: 'Số lượng bài viết', example: 10, required: false })
  @ApiResponse({ status: 200, description: 'Danh sách bài viết phổ biến', type: [News] })
  findPopular(@Query('limit') limit?: number): Promise<News[]> {
    return this.newsService.findPopular(limit);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Lấy bài viết mới nhất' })
  @ApiQuery({ name: 'limit', description: 'Số lượng bài viết', example: 10, required: false })
  @ApiResponse({ status: 200, description: 'Danh sách bài viết mới nhất', type: [News] })
  findRecent(@Query('limit') limit?: number): Promise<News[]> {
    return this.newsService.findRecent(limit);
  }

  @Get('author/:authorId')
  @ApiOperation({ summary: 'Lấy bài viết theo tác giả' })
  @ApiResponse({ status: 200, description: 'Danh sách bài viết của tác giả', type: [News] })
  findByAuthor(@Param('authorId', ParseIntPipe) authorId: number): Promise<News[]> {
    return this.newsService.findByAuthor(authorId);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Lấy bài viết theo danh mục' })
  @ApiResponse({ status: 200, description: 'Danh sách bài viết theo danh mục', type: [News] })
  findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number): Promise<News[]> {
    return this.newsService.findByCategory(categoryId);
  }

  @Get('type')
  @ApiOperation({ summary: 'Lấy bài viết theo loại' })
  @ApiQuery({ name: 'type', description: 'Loại bài viết', example: 'news' })
  @ApiResponse({ status: 200, description: 'Danh sách bài viết theo loại', type: [News] })
  findByType(@Query('type') type: string): Promise<News[]> {
    return this.newsService.findByType(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy bài viết theo ID' })
  @ApiResponse({ status: 200, description: 'Chi tiết bài viết', type: News })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<News> {
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật bài viết' })
  @ApiResponse({ status: 200, description: 'Bài viết đã được cập nhật', type: News })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateNewsDto: UpdateNewsDto): Promise<News> {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài viết' })
  @ApiResponse({ status: 200, description: 'Bài viết đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  remove(@Param('id', ParseIntPipe) id: string): Promise<void> {
    return this.newsService.remove(+id);
  }

  @Patch(':id/views')
  @ApiOperation({ summary: 'Tăng số lượt xem bài viết' })
  @ApiResponse({ status: 200, description: 'Số lượt xem đã được tăng', type: News })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  incrementViews(@Param('id', ParseIntPipe) id: number): Promise<News> {
    return this.newsService.incrementViews(id);
  }

  @Patch(':id/like')
  @ApiOperation({ summary: 'Thích bài viết' })
  @ApiResponse({ status: 200, description: 'Đã thích bài viết', type: News })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  likeNews(@Param('id', ParseIntPipe) id: number): Promise<News> {
    return this.newsService.likeNews(id);
  }

  @Patch(':id/unlike')
  @ApiOperation({ summary: 'Bỏ thích bài viết' })
  @ApiResponse({ status: 200, description: 'Đã bỏ thích bài viết', type: News })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  unlikeNews(@Param('id', ParseIntPipe) id: number): Promise<News> {
    return this.newsService.unlikeNews(id);
  }

  @Patch(':id/comments-count')
  @ApiOperation({ summary: 'Cập nhật số lượng bình luận' })
  @ApiResponse({ status: 200, description: 'Số lượng bình luận đã được cập nhật', type: News })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  updateCommentsCount(
    @Param('id', ParseIntPipe) id: number,
    @Body('count', ParseIntPipe) count: number,
  ): Promise<News> {
    return this.newsService.updateCommentsCount(id, count);
  }
}
