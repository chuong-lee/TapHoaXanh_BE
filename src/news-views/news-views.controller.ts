import { Controller, Get, Post, Delete, Body, Param, Query, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { NewsViewsService } from './news-views.service';
import { CreateNewsViewDto } from './dto/create-news-view.dto';
import { QueryNewsViewDto } from './dto/query-news-view.dto';
import { NewsViews } from './entities/news-views.entity';

@ApiTags('News Views')
@Controller('news-views')
export class NewsViewsController {
  constructor(private readonly newsViewsService: NewsViewsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo lượt xem bài viết mới' })
  @ApiResponse({
    status: 201,
    description: 'Lượt xem đã được tạo thành công',
    type: NewsViews,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ',
  })
  @ApiResponse({
    status: 409,
    description: 'Người dùng đã xem bài viết này rồi',
  })
  create(@Body() createNewsViewDto: CreateNewsViewDto): Promise<NewsViews> {
    return this.newsViewsService.create(createNewsViewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả lượt xem bài viết' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả lượt xem',
    type: [NewsViews],
  })
  findAll(@Query() queryDto: QueryNewsViewDto): Promise<NewsViews[]> {
    if (Object.keys(queryDto).length > 0) {
      return this.newsViewsService.findWithFilters(queryDto);
    }
    return this.newsViewsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy lịch sử xem của người dùng' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử xem của người dùng',
    type: [NewsViews],
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy lịch sử xem của người dùng này',
  })
  findByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<NewsViews[]> {
    return this.newsViewsService.findByUserId(userId);
  }

  @Get('news/:newsId')
  @ApiOperation({ summary: 'Lấy lượt xem của bài viết' })
  @ApiParam({ name: 'newsId', description: 'ID của bài viết' })
  @ApiResponse({
    status: 200,
    description: 'Lượt xem của bài viết',
    type: [NewsViews],
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy lượt xem của bài viết này',
  })
  findByNewsId(@Param('newsId', ParseIntPipe) newsId: number): Promise<NewsViews[]> {
    return this.newsViewsService.findByNewsId(newsId);
  }

  @Get('user/:userId/news/:newsId')
  @ApiOperation({ summary: 'Kiểm tra người dùng đã xem bài viết chưa' })
  @ApiResponse({ status: 200, description: 'Thông tin lượt xem', type: NewsViews })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lượt xem' })
  async findByUserAndNews(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('newsId', ParseIntPipe) newsId: number,
  ): Promise<NewsViews> {
    const view = await this.newsViewsService.findByUserAndNews(userId, newsId);
    if (!view) {
      throw new NotFoundException('Người dùng chưa xem bài viết này');
    }
    return view;
  }

  @Get('count/news/:newsId')
  @ApiOperation({ summary: 'Đếm số lượt xem của bài viết' })
  @ApiResponse({ status: 200, description: 'Số lượt xem của bài viết' })
  async getViewsCountByNews(
    @Param('newsId', ParseIntPipe) newsId: number,
  ): Promise<{ newsId: number; viewCount: number }> {
    const count = await this.newsViewsService.getViewCountByNewsId(newsId);
    return { newsId, viewCount: count };
  }

  @Get('count/user/:userId')
  @ApiOperation({ summary: 'Đếm số bài viết đã xem của người dùng' })
  @ApiResponse({ status: 200, description: 'Số bài viết đã xem' })
  async getViewsCountByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ userId: number; viewCount: number }> {
    const count = await this.newsViewsService.getViewCountByUserId(userId);
    return { userId, viewCount: count };
  }

  @Delete('user/:userId/news/:newsId')
  @ApiOperation({ summary: 'Xóa lượt xem cụ thể' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiParam({ name: 'newsId', description: 'ID của bài viết' })
  @ApiResponse({
    status: 200,
    description: 'Lượt xem đã được xóa',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy lịch sử xem để xóa',
  })
  remove(@Param('userId', ParseIntPipe) userId: number, @Param('newsId', ParseIntPipe) newsId: number): Promise<void> {
    return this.newsViewsService.remove(userId, newsId);
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Xóa tất cả lượt xem của người dùng' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Tất cả lượt xem của người dùng đã được xóa',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy lịch sử xem của người dùng này',
  })
  removeByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    return this.newsViewsService.removeByUserId(userId);
  }

  @Delete('news/:newsId')
  @ApiOperation({ summary: 'Xóa tất cả lượt xem của bài viết' })
  @ApiParam({ name: 'newsId', description: 'ID của bài viết' })
  @ApiResponse({
    status: 200,
    description: 'Tất cả lượt xem của bài viết đã được xóa',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy lượt xem của bài viết này',
  })
  removeByNewsId(@Param('newsId', ParseIntPipe) newsId: number): Promise<void> {
    return this.newsViewsService.removeByNewsId(newsId);
  }
}
