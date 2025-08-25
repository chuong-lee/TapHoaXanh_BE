import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { BaseRepository } from '../database/abstract.repository';
import { QueryNewsDto } from './dto/query-news.dto';
import { PaginatedNewsDto } from './dto/paginated-news.dto';

@Injectable()
export class NewsRepository extends BaseRepository<News> {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {
    super(newsRepository);
  }

  async findAllWithRelations(): Promise<News[]> {
    return this.newsRepository.find({
      relations: ['author', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneWithRelations(id: number): Promise<News | null> {
    return this.newsRepository.findOne({
      where: { id },
      relations: ['author', 'category'],
    });
  }

  async findWithPagination(queryDto: QueryNewsDto): Promise<PaginatedNewsDto> {
    const { search, type, category_id, author_id } = queryDto;
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.newsRepository
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.author', 'author')
      .leftJoinAndSelect('news.category', 'category');

    // Apply filters
    if (search) {
      queryBuilder.andWhere('(news.name LIKE :search OR news.description LIKE :search OR news.summary LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (type) {
      queryBuilder.andWhere('news.type = :type', { type });
    }

    if (category_id) {
      queryBuilder.andWhere('news.category_id = :category_id', { category_id });
    }

    if (author_id) {
      queryBuilder.andWhere('news.author_id = :author_id', { author_id });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const data = await queryBuilder.orderBy('news.createdAt', 'DESC').skip(skip).take(limit).getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async incrementViews(id: number): Promise<void> {
    await this.newsRepository.increment({ id }, 'views', 1);
  }

  async incrementLikes(id: number): Promise<void> {
    await this.newsRepository.increment({ id }, 'likes', 1);
  }

  async decrementLikes(id: number): Promise<void> {
    await this.newsRepository.decrement({ id }, 'likes', 1);
  }

  async updateCommentsCount(id: number, count: number): Promise<void> {
    await this.newsRepository.update(id, { comments_count: count });
  }

  async findByAuthor(authorId: number): Promise<News[]> {
    return this.newsRepository.find({
      where: { author_id: authorId },
      relations: ['author', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCategory(categoryId: number): Promise<News[]> {
    return this.newsRepository.find({
      where: { category_id: categoryId },
      relations: ['author', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByType(type: string): Promise<News[]> {
    return this.newsRepository.find({
      where: { type },
      relations: ['author', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPopular(limit: number = 10): Promise<News[]> {
    return this.newsRepository.find({
      relations: ['author', 'category'],
      order: { views: 'DESC', likes: 'DESC' },
      take: limit,
    });
  }

  async findRecent(limit: number = 10): Promise<News[]> {
    return this.newsRepository.find({
      relations: ['author', 'category'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
