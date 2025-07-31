import { BaseRepository } from 'src/database/abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsViews } from './entities/news-views.entity';
import { QueryNewsViewDto } from './dto/query-news-view.dto';
import { PaginatedNewsViewDto } from './dto/paginated-news-view.dto';

@Injectable()
export class NewsViewsRepository extends BaseRepository<NewsViews> {
  protected readonly logger = new Logger(NewsViewsRepository.name);

  constructor(
    @InjectRepository(NewsViews)
    newsViewsRepository: Repository<NewsViews>,
  ) {
    super(newsViewsRepository);
  }

  async findAllWithRelations(): Promise<NewsViews[]> {
    return this.repository.find({
      relations: ['user', 'news'],
      order: { viewed_at: 'DESC' },
    });
  }

  async findByUserId(userId: number): Promise<NewsViews[]> {
    return this.repository.find({
      where: { user_id: userId },
      relations: ['news'],
      order: { viewed_at: 'DESC' },
    });
  }

  async findByNewsId(newsId: number): Promise<NewsViews[]> {
    return this.repository.find({
      where: { news_id: newsId },
      relations: ['user'],
      order: { viewed_at: 'DESC' },
    });
  }

  async findByUserAndNews(userId: number, newsId: number): Promise<NewsViews | null> {
    return this.repository.findOne({
      where: { user_id: userId, news_id: newsId },
      relations: ['user', 'news'],
    });
  }

  async findWithPagination(queryDto: QueryNewsViewDto): Promise<PaginatedNewsViewDto> {
    const { page = 1, limit = 10, user_id, news_id } = queryDto;
    const offset = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('newsViews')
      .leftJoinAndSelect('newsViews.user', 'user')
      .leftJoinAndSelect('newsViews.news', 'news');

    if (user_id) {
      queryBuilder.andWhere('newsViews.user_id = :user_id', { user_id });
    }

    if (news_id) {
      queryBuilder.andWhere('newsViews.news_id = :news_id', { news_id });
    }

    const [data, total] = await queryBuilder
      .orderBy('newsViews.viewed_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findWithFilters(queryDto: QueryNewsViewDto): Promise<NewsViews[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('newsViews')
      .leftJoinAndSelect('newsViews.user', 'user')
      .leftJoinAndSelect('newsViews.news', 'news');

    if (queryDto.user_id) {
      queryBuilder.andWhere('newsViews.user_id = :user_id', { user_id: queryDto.user_id });
    }

    if (queryDto.news_id) {
      queryBuilder.andWhere('newsViews.news_id = :news_id', { news_id: queryDto.news_id });
    }

    return queryBuilder.orderBy('newsViews.viewed_at', 'DESC').getMany();
  }

  async getViewCountByNewsId(newsId: number): Promise<number> {
    return this.repository.count({ where: { news_id: newsId } });
  }

  async getViewCountByUserId(userId: number): Promise<number> {
    return this.repository.count({ where: { user_id: userId } });
  }

  async removeByUserAndNews(userId: number, newsId: number): Promise<boolean> {
    const result = await this.repository.delete({ user_id: userId, news_id: newsId });
    return (result.affected ?? 0) > 0;
  }

  async removeByUserId(userId: number): Promise<void> {
    await this.repository.delete({ user_id: userId });
  }

  async removeByNewsId(newsId: number): Promise<void> {
    await this.repository.delete({ news_id: newsId });
  }
}
