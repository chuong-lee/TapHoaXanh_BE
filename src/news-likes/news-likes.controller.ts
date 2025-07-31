import { Controller, Get, Post, Delete, Body, Param, Query, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NewsLikesService } from './news-likes.service';
import { CreateNewsLikeDto } from './dto/create-news-like.dto';
import { QueryNewsLikeDto } from './dto/query-news-like.dto';
import { PaginatedNewsLikeDto } from './dto/paginated-news-like.dto';
import { NewsLikes } from './entities/news-likes.entity';

@ApiTags('News Likes')
@Controller('news-likes')
export class NewsLikesController {
  constructor(private readonly newsLikesService: NewsLikesService) {}

  @Post()
  @ApiOperation({ summary: 'Thích bài viết' })
  @ApiResponse({
    status: 201,
    description: 'Đã thích bài viết thành công',
    type: NewsLikes,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
  })
  @ApiResponse({
    status: 409,
    description: 'Người dùng đã thích bài viết này rồi',
  })
  create(@Body() createNewsLikeDto: CreateNewsLikeDto): Promise<NewsLikes> {
    return this.newsLikesService.create(createNewsLikeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả lượt thích bài viết' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả lượt thích',
    type: [NewsLikes],
  })
  findAll(@Query() queryDto: QueryNewsLikeDto): Promise<NewsLikes[]> {
    if (Object.keys(queryDto).length > 0) {
      return this.newsLikesService.findWithFilters(queryDto);
    }
    return this.newsLikesService.findAll();
  }

  @Get('pagination')
  @ApiOperation({ summary: 'Lấy lượt thích với phân trang' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lượt thích với phân trang',
    type: PaginatedNewsLikeDto,
  })
  findWithPagination(@Query() queryDto: QueryNewsLikeDto): Promise<PaginatedNewsLikeDto> {
    return this.newsLikesService.findWithPagination(queryDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy bài viết yêu thích của người dùng' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bài viết yêu thích của người dùng',
    type: [NewsLikes],
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bài viết yêu thích của người dùng này',
  })
  findByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<NewsLikes[]> {
    return this.newsLikesService.findByUserId(userId);
  }

  @Get('news/:newsId')
  @ApiOperation({ summary: 'Lấy lượt thích của bài viết' })
  @ApiParam({ name: 'newsId', description: 'ID của bài viết' })
  @ApiResponse({
    status: 200,
    description: 'Lượt thích của bài viết',
    type: [NewsLikes],
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy lượt thích của bài viết này',
  })
  findByNewsId(@Param('newsId', ParseIntPipe) newsId: number): Promise<NewsLikes[]> {
    return this.newsLikesService.findByNewsId(newsId);
  }

  @Get('user/:userId/news/:newsId')
  @ApiOperation({ summary: 'Kiểm tra người dùng đã thích bài viết chưa' })
  @ApiResponse({ status: 200, description: 'Thông tin lượt thích', type: NewsLikes })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lượt thích' })
  async findByUserAndNews(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('newsId', ParseIntPipe) newsId: number,
  ): Promise<NewsLikes> {
    const like = await this.newsLikesService.findByUserAndNews(userId, newsId);
    if (!like) {
      throw new NotFoundException('Người dùng chưa thích bài viết này');
    }
    return like;
  }

  @Get('count/news/:newsId')
  @ApiOperation({ summary: 'Đếm số lượt thích của bài viết' })
  @ApiResponse({ status: 200, description: 'Số lượt thích của bài viết' })
  async getLikeCountByNews(
    @Param('newsId', ParseIntPipe) newsId: number,
  ): Promise<{ newsId: number; likeCount: number }> {
    const count = await this.newsLikesService.getLikeCountByNewsId(newsId);
    return { newsId, likeCount: count };
  }

  @Get('count/user/:userId')
  @ApiOperation({ summary: 'Đếm số bài viết đã thích của người dùng' })
  @ApiResponse({ status: 200, description: 'Số bài viết đã thích' })
  async getLikeCountByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ userId: number; likeCount: number }> {
    const count = await this.newsLikesService.getLikeCountByUserId(userId);
    return { userId, likeCount: count };
  }

  @Get('popular')
  @ApiOperation({ summary: 'Lấy bài viết được thích nhiều nhất' })
  @ApiQuery({ name: 'limit', description: 'Số lượng bài viết', example: 10, required: false })
  @ApiResponse({ status: 200, description: 'Danh sách bài viết được thích nhiều nhất' })
  getMostLikedNews(@Query('limit', ParseIntPipe) limit: number = 10): Promise<any[]> {
    return this.newsLikesService.getMostLikedNews(limit);
  }

  @Delete('user/:userId/news/:newsId')
  @ApiOperation({ summary: 'Bỏ thích bài viết cụ thể' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiParam({ name: 'newsId', description: 'ID của bài viết' })
  @ApiResponse({
    status: 200,
    description: 'Đã bỏ thích bài viết',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy lượt thích để xóa',
  })
  remove(@Param('userId', ParseIntPipe) userId: number, @Param('newsId', ParseIntPipe) newsId: number): Promise<void> {
    return this.newsLikesService.remove(userId, newsId);
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Xóa tất cả lượt thích của người dùng' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Tất cả lượt thích của người dùng đã được xóa',
  })
  removeByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    return this.newsLikesService.removeByUserId(userId);
  }

  @Delete('news/:newsId')
  @ApiOperation({ summary: 'Xóa tất cả lượt thích của bài viết' })
  @ApiParam({ name: 'newsId', description: 'ID của bài viết' })
  @ApiResponse({
    status: 200,
    description: 'Tất cả lượt thích của bài viết đã được xóa',
  })
  removeByNewsId(@Param('newsId', ParseIntPipe) newsId: number): Promise<void> {
    return this.newsLikesService.removeByNewsId(newsId);
  }
}
