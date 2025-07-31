import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { NewsLikesRepository } from './news-likes.repository';
import { CreateNewsLikeDto } from './dto/create-news-like.dto';
import { QueryNewsLikeDto } from './dto/query-news-like.dto';
import { PaginatedNewsLikeDto } from './dto/paginated-news-like.dto';
import { NewsLikes } from './entities/news-likes.entity';

@Injectable()
export class NewsLikesService {
  constructor(private readonly newsLikesRepository: NewsLikesRepository) {}

  async create(createNewsLikeDto: CreateNewsLikeDto): Promise<NewsLikes> {
    // Kiểm tra xem user đã thích bài viết này chưa
    const existingLike = await this.newsLikesRepository.findByUserAndNews(
      createNewsLikeDto.user_id,
      createNewsLikeDto.news_id,
    );

    if (existingLike) {
      throw new ConflictException('Người dùng đã thích bài viết này rồi');
    }

    const newsLike = this.newsLikesRepository.create({
      ...createNewsLikeDto,
      liked_at: new Date(),
    });

    return await this.newsLikesRepository.save(newsLike);
  }

  async findAll(): Promise<NewsLikes[]> {
    return await this.newsLikesRepository.findAllWithRelations();
  }

  async findWithPagination(queryDto: QueryNewsLikeDto): Promise<PaginatedNewsLikeDto> {
    return await this.newsLikesRepository.findWithPagination(queryDto);
  }

  async findWithFilters(queryDto: QueryNewsLikeDto): Promise<NewsLikes[]> {
    return await this.newsLikesRepository.findWithFilters(queryDto);
  }

  async findByUserId(userId: number): Promise<NewsLikes[]> {
    const likes = await this.newsLikesRepository.findByUserId(userId);
    if (!likes.length) {
      throw new NotFoundException('Không tìm thấy bài viết yêu thích của người dùng này');
    }
    return likes;
  }

  async findByNewsId(newsId: number): Promise<NewsLikes[]> {
    const likes = await this.newsLikesRepository.findByNewsId(newsId);
    if (!likes.length) {
      throw new NotFoundException('Không tìm thấy lượt thích cho bài viết này');
    }
    return likes;
  }

  async findByUserAndNews(userId: number, newsId: number): Promise<NewsLikes | null> {
    return await this.newsLikesRepository.findByUserAndNews(userId, newsId);
  }

  async remove(userId: number, newsId: number): Promise<void> {
    const result = await this.newsLikesRepository.removeByUserAndNews(userId, newsId);
    if (!result) {
      throw new NotFoundException('Không tìm thấy lượt thích để xóa');
    }
  }

  async removeByUserId(userId: number): Promise<void> {
    await this.newsLikesRepository.removeByUserId(userId);
  }

  async removeByNewsId(newsId: number): Promise<void> {
    await this.newsLikesRepository.removeByNewsId(newsId);
  }

  async getLikeCountByNewsId(newsId: number): Promise<number> {
    return await this.newsLikesRepository.getLikeCountByNewsId(newsId);
  }

  async getLikeCountByUserId(userId: number): Promise<number> {
    return await this.newsLikesRepository.getLikeCountByUserId(userId);
  }

  async getMostLikedNews(limit: number = 10): Promise<any[]> {
    return await this.newsLikesRepository.getMostLikedNews(limit);
  }
}
