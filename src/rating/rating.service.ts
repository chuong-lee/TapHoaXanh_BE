import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { QueryRatingDto } from './dto/query-rating.dto';
import { RatingRepository } from './rating.repository';
import { Rating } from './entities/rating.entity';
import { PaginationResult } from '../interface/IPagination';

@Injectable()
export class RatingService {
  constructor(private readonly ratingRepository: RatingRepository) {}

  async create(createRatingDto: CreateRatingDto): Promise<Rating> {
    const { user_id, product_id, rating, comment } = createRatingDto;

    // Kiểm tra xem user đã đánh giá sản phẩm này chưa
    const existingRating = await this.ratingRepository.checkUserHasRatedProduct(user_id, product_id);
    if (existingRating) {
      throw new ConflictException('Bạn đã đánh giá sản phẩm này rồi');
    }

    // Tạo rating mới
    const newRating = this.ratingRepository.create({
      rating,
      comment,
      users: { id: user_id },
      product: { id: product_id }
    });

    return await this.ratingRepository.save(newRating);
  }

  async findAll(query: QueryRatingDto): Promise<PaginationResult<Rating>> {
    return await this.ratingRepository.findRatingsWithPagination(query);
  }

  async findOne(id: number): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['users', 'product']
    });

    if (!rating) {
      throw new NotFoundException(`Rating với ID ${id} không tồn tại`);
    }

    return rating;
  }

  async update(id: number, updateRatingDto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.findOne(id);

    // Cập nhật rating
    Object.assign(rating, updateRatingDto);
    
    return await this.ratingRepository.save(rating);
  }

  async remove(id: number): Promise<void> {
    const rating = await this.findOne(id);
    await this.ratingRepository.remove(rating);
  }

  // Lấy đánh giá theo sản phẩm
  async getRatingsByProduct(productId: number, query: QueryRatingDto): Promise<PaginationResult<Rating>> {
    const queryWithProduct = { ...query, product_id: productId };
    return await this.ratingRepository.findRatingsWithPagination(queryWithProduct);
  }

  // Lấy đánh giá theo user
  async getRatingsByUser(userId: number, query: QueryRatingDto): Promise<PaginationResult<Rating>> {
    const queryWithUser = { ...query, user_id: userId };
    return await this.ratingRepository.findRatingsWithPagination(queryWithUser);
  }

  // Lấy điểm đánh giá trung bình của sản phẩm
  async getAverageRatingByProduct(productId: number): Promise<{ average: number; count: number }> {
    return await this.ratingRepository.getAverageRatingByProduct(productId);
  }

  // Lấy phân bố đánh giá của sản phẩm
  async getRatingDistributionByProduct(productId: number): Promise<{ rating: number; count: number }[]> {
    return await this.ratingRepository.getRatingDistributionByProduct(productId);
  }

  // Lấy top sản phẩm được đánh giá cao
  async getTopRatedProducts(limit: number = 10): Promise<any[]> {
    return await this.ratingRepository.getTopRatedProducts(limit);
  }

  // Kiểm tra user đã đánh giá sản phẩm chưa
  async checkUserHasRatedProduct(userId: number, productId: number): Promise<boolean> {
    const rating = await this.ratingRepository.checkUserHasRatedProduct(userId, productId);
    return !!rating;
  }

  // Lấy thống kê tổng quan về rating
  async getRatingStatistics(): Promise<any> {
    const totalRatings = await this.ratingRepository.count();
    
    const ratingStats = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('rating.rating', 'rating')
      .addSelect('COUNT(rating.id)', 'count')
      .groupBy('rating.rating')
      .orderBy('rating.rating', 'ASC')
      .getRawMany();

    const averageRating = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'average')
      .getRawOne();

    return {
      totalRatings,
      averageRating: parseFloat(averageRating.average) || 0,
      distribution: ratingStats,
      totalProducts: await this.ratingRepository
        .createQueryBuilder('rating')
        .select('COUNT(DISTINCT rating.product_id)', 'count')
        .getRawOne()
        .then(result => parseInt(result.count) || 0),
      totalUsers: await this.ratingRepository
        .createQueryBuilder('rating')
        .select('COUNT(DISTINCT rating.user_id)', 'count')
        .getRawOne()
        .then(result => parseInt(result.count) || 0)
    };
  }
}
