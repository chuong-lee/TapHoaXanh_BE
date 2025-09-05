import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { QueryRatingDto } from './dto/query-rating.dto';
import { PaginationResult } from '../interface/IPagination';

@Injectable()
export class RatingRepository extends Repository<Rating> {
  constructor(private dataSource: DataSource) {
    super(Rating, dataSource.createEntityManager());
  }

  async findRatingsWithPagination(query: QueryRatingDto): Promise<PaginationResult<Rating>> {
    const { page = 1, limit = 10, product_id, user_id, rating, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    
    const queryBuilder = this.createQueryBuilder('rating')
      .leftJoinAndSelect('rating.users', 'user')
      .leftJoinAndSelect('rating.product', 'product')
      .select([
        'rating.id',
        'rating.rating',
        'rating.comment',
        'rating.createdAt',
        'rating.updatedAt',
        'user.id',
        'user.username',
        'user.email',
        'product.id',
        'product.name',
        'product.price'
      ]);

    // Apply filters
    if (product_id) {
      queryBuilder.andWhere('rating.product_id = :product_id', { product_id });
    }

    if (user_id) {
      queryBuilder.andWhere('rating.user_id = :user_id', { user_id });
    }

    if (rating) {
      queryBuilder.andWhere('rating.rating = :rating', { rating });
    }

    if (search) {
      queryBuilder.andWhere('rating.comment LIKE :search', { search: `%${search}%` });
    }

    // Apply sorting
    queryBuilder.orderBy(`rating.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [ratings, total] = await queryBuilder.getManyAndCount();

    return {
      data: ratings,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit)
      }
    };
  }

  async getAverageRatingByProduct(productId: number): Promise<{ average: number; count: number }> {
    const result = await this.createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'average')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.product_id = :productId', { productId })
      .getRawOne();

    return {
      average: parseFloat(result.average) || 0,
      count: parseInt(result.count) || 0
    };
  }

  async getRatingDistributionByProduct(productId: number): Promise<{ rating: number; count: number }[]> {
    return await this.createQueryBuilder('rating')
      .select('rating.rating', 'rating')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.product_id = :productId', { productId })
      .groupBy('rating.rating')
      .orderBy('rating.rating', 'ASC')
      .getRawMany();
  }

  async checkUserHasRatedProduct(userId: number, productId: number): Promise<Rating | null> {
    return await this.findOne({
      where: {
        users: { id: userId },
        product: { id: productId }
      }
    });
  }

  async getTopRatedProducts(limit: number = 10): Promise<any[]> {
    return await this.createQueryBuilder('rating')
      .leftJoinAndSelect('rating.product', 'product')
      .select([
        'product.id',
        'product.name',
        'product.price',
        'AVG(rating.rating) as averageRating',
        'COUNT(rating.id) as ratingCount'
      ])
      .groupBy('product.id')
      .having('COUNT(rating.id) >= 5') // Chỉ lấy sản phẩm có ít nhất 5 đánh giá
      .orderBy('averageRating', 'DESC')
      .addOrderBy('ratingCount', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
