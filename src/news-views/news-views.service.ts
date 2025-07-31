import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { NewsViewsRepository } from './news-views.repository';
import { CreateNewsViewDto } from './dto/create-news-view.dto';
import { QueryNewsViewDto } from './dto/query-news-view.dto';
import { PaginatedNewsViewDto } from './dto/paginated-news-view.dto';
import { NewsViews } from './entities/news-views.entity';

@Injectable()
export class NewsViewsService {
  constructor(private readonly newsViewsRepository: NewsViewsRepository) {}

  async create(createNewsViewDto: CreateNewsViewDto): Promise<NewsViews> {
    // Kiểm tra xem user đã xem bài viết này chưa
    const existingView = await this.newsViewsRepository.findByUserAndNews(
      createNewsViewDto.user_id,
      createNewsViewDto.news_id,
    );

    if (existingView) {
      throw new ConflictException('Người dùng đã xem bài viết này rồi');
    }

    const newsView = this.newsViewsRepository.create({
      ...createNewsViewDto,
      viewed_at: new Date(),
    });

    return await this.newsViewsRepository.save(newsView);
  }

  async findAll(): Promise<NewsViews[]> {
    return await this.newsViewsRepository.findAllWithRelations();
  }

  async findWithPagination(queryDto: QueryNewsViewDto): Promise<PaginatedNewsViewDto> {
    return await this.newsViewsRepository.findWithPagination(queryDto);
  }

  async findWithFilters(queryDto: QueryNewsViewDto): Promise<NewsViews[]> {
    return await this.newsViewsRepository.findWithFilters(queryDto);
  }

  async findByUserId(userId: number): Promise<NewsViews[]> {
    const views = await this.newsViewsRepository.findByUserId(userId);
    if (!views.length) {
      throw new NotFoundException('Không tìm thấy lịch sử xem của người dùng này');
    }
    return views;
  }

  async findByNewsId(newsId: number): Promise<NewsViews[]> {
    const views = await this.newsViewsRepository.findByNewsId(newsId);
    if (!views.length) {
      throw new NotFoundException('Không tìm thấy lượt xem cho bài viết này');
    }
    return views;
  }

  async findByUserAndNews(userId: number, newsId: number): Promise<NewsViews | null> {
    return await this.newsViewsRepository.findByUserAndNews(userId, newsId);
  }

  async remove(userId: number, newsId: number): Promise<void> {
    const result = await this.newsViewsRepository.removeByUserAndNews(userId, newsId);
    if (!result) {
      throw new NotFoundException('Không tìm thấy lượt xem để xóa');
    }
  }

  async removeByUserId(userId: number): Promise<void> {
    await this.newsViewsRepository.removeByUserId(userId);
  }

  async removeByNewsId(newsId: number): Promise<void> {
    await this.newsViewsRepository.removeByNewsId(newsId);
  }

  async getViewCountByNewsId(newsId: number): Promise<number> {
    return await this.newsViewsRepository.getViewCountByNewsId(newsId);
  }

  async getViewCountByUserId(userId: number): Promise<number> {
    return await this.newsViewsRepository.getViewCountByUserId(userId);
  }
}
