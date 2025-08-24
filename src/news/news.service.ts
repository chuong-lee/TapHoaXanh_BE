import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { PaginatedNewsDto } from './dto/paginated-news.dto';
import { NewsRepository } from './news.repository';
import { News } from './entities/news.entity';

@Injectable()
export class NewsService {
  constructor(private readonly newsRepository: NewsRepository) {}

  async create(createNewsDto: CreateNewsDto): Promise<News> {
    try {
      const newsData = {
        ...createNewsDto,
        views: 0,
        likes: 0,
        comments_count: 0,
      };

      const news = this.newsRepository.create(newsData);
      const savedNews = await this.newsRepository.save(news);
      return this.findOne(savedNews.id);
    } catch (error) {
      throw new BadRequestException('Không thể tạo bài viết mới');
    }
  }

  async findAll(): Promise<News[]> {
    return this.newsRepository.findAllWithRelations();
  }

  async findWithPagination(queryDto: QueryNewsDto): Promise<PaginatedNewsDto> {
    return this.newsRepository.findWithPagination(queryDto);
  }

  async findOne(id: number): Promise<News> {
    const news = await this.newsRepository.findOneWithRelations(id);
    if (!news) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID ${id}`);
    }
    return news;
  }

  async update(id: number, updateNewsDto: UpdateNewsDto): Promise<News> {
    const existingNews = await this.newsRepository.findById(id);
    if (!existingNews) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID ${id}`);
    }

    await this.newsRepository.update(id, updateNewsDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existingNews = await this.newsRepository.findById(id);
    if (!existingNews) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID ${id}`);
    }

    await this.newsRepository.delete(id);
  }

  async incrementViews(id: number): Promise<News> {
    await this.newsRepository.incrementViews(id);
    return this.findOne(id);
  }

  async likeNews(id: number): Promise<News> {
    await this.findOne(id); // Verify news exists
    await this.newsRepository.incrementLikes(id);
    return this.findOne(id);
  }

  async unlikeNews(id: number): Promise<News> {
    const news = await this.findOne(id);
    if ((news.likes ?? 0) > 0) {
      // dùng ?? để fallback về 0 nếu undefined
      await this.newsRepository.decrementLikes(id);
    }
    return this.findOne(id);
  }

  async findByAuthor(authorId: number): Promise<News[]> {
    return this.newsRepository.findByAuthor(authorId);
  }

  async findByCategory(categoryId: number): Promise<News[]> {
    return this.newsRepository.findByCategory(categoryId);
  }

  async findByType(type: string): Promise<News[]> {
    return this.newsRepository.findByType(type);
  }

  async findPopular(limit: number = 10): Promise<News[]> {
    return this.newsRepository.findPopular(limit);
  }

  async findRecent(limit: number = 10): Promise<News[]> {
    return this.newsRepository.findRecent(limit);
  }

  async updateCommentsCount(id: number, count: number): Promise<News> {
    await this.newsRepository.updateCommentsCount(id, count);
    return this.findOne(id);
  }
}
