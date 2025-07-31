import { BaseRepository } from 'src/database/abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsLikes } from './entities/news-likes.entity';
import { QueryNewsLikeDto } from './dto/query-news-like.dto';
import { PaginatedNewsLikeDto } from './dto/paginated-news-like.dto';

@Injectable()
export class NewsLikesRepository extends BaseRepository<NewsLikes> {
  protected readonly logger = new Logger(NewsLikesRepository.name);

  constructor(
    @InjectRepository(NewsLikes)
    newsLikesRepository: Repository<NewsLikes>,
  ) {
    super(newsLikesRepository);
  }

  async findAllWithRelations(): Promise<NewsLikes[]> {
    return this.repository.find({
      relations: ['user', 'news'],
      order: { liked_at: 'DESC' },
    });
  }

  async findByUserId(userId: number): Promise<NewsLikes[]> {
    return this.repository.find({
      where: { user_id: userId },
      relations: ['news'],
      order: { liked_at: 'DESC' },
    });
  }

  async findByNewsId(newsId: number): Promise<NewsLikes[]> {
    return this.repository.find({
      where: { news_id: newsId },
      relations: ['user'],
      order: { liked_at: 'DESC' },
    });
  }

  async findByUserAndNews(userId: number, newsId: number): Promise<NewsLikes | null> {
    return this.repository.findOne({
      where: { user_id: userId, news_id: newsId },
      relations: ['user', 'news'],
    });
  }

  async findWithFilters(queryDto: QueryNewsLikeDto): Promise<NewsLikes[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('newsLikes')
      .leftJoinAndSelect('newsLikes.user', 'user')
      .leftJoinAndSelect('newsLikes.news', 'news');

    if (queryDto.user_id) {
      queryBuilder.andWhere('newsLikes.user_id = :user_id', { user_id: queryDto.user_id });
    }

    if (queryDto.news_id) {
      queryBuilder.andWhere('newsLikes.news_id = :news_id', { news_id: queryDto.news_id });
    }

    if (queryDto.from_date) {
      queryBuilder.andWhere('newsLikes.liked_at >= :from_date', { from_date: queryDto.from_date });
    }

    if (queryDto.to_date) {
      queryBuilder.andWhere('newsLikes.liked_at <= :to_date', { to_date: queryDto.to_date });
    }

    return queryBuilder.orderBy('newsLikes.liked_at', 'DESC').getMany();
  }

  async findWithPagination(queryDto: QueryNewsLikeDto): Promise<PaginatedNewsLikeDto> {
    const { page = 1, limit = 10, user_id, news_id, from_date, to_date } = queryDto;
    const offset = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('newsLikes')
      .leftJoinAndSelect('newsLikes.user', 'user')
      .leftJoinAndSelect('newsLikes.news', 'news');

    if (user_id) {
      queryBuilder.andWhere('newsLikes.user_id = :user_id', { user_id });
    }

    if (news_id) {
      queryBuilder.andWhere('newsLikes.news_id = :news_id', { news_id });
    }

    if (from_date) {
      queryBuilder.andWhere('newsLikes.liked_at >= :from_date', { from_date });
    }

    if (to_date) {
      queryBuilder.andWhere('newsLikes.liked_at <= :to_date', { to_date });
    }

    const [data, total] = await queryBuilder
      .orderBy('newsLikes.liked_at', 'DESC')
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

  async getLikeCountByNewsId(newsId: number): Promise<number> {
    return this.repository.count({ where: { news_id: newsId } });
  }

  async getLikeCountByUserId(userId: number): Promise<number> {
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

  async getMostLikedNews(limit: number = 10): Promise<any[]> {
    return this.repository
      .createQueryBuilder('newsLikes')
      .select('newsLikes.news_id', 'news_id')
      .addSelect('COUNT(*)', 'like_count')
      .leftJoin('newsLikes.news', 'news')
      .addSelect('news.title', 'news_title')
      .groupBy('newsLikes.news_id')
      .orderBy('like_count', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
