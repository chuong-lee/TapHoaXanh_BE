import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/database/abstract.repository';
import { Repository } from 'typeorm';
import { FilterProductVariantDto } from './dto/filter-product-variant.dto';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductVariantRepository extends BaseRepository<ProductVariant> {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {
    super(variantRepo);
  }

  async findOne(id: number): Promise<ProductVariant | null> {
    return this.variantRepo.findOne({
      where: { id },
      relations: ['product'],
    });
  }

  async findOneByProductId(id: number): Promise<ProductVariant | null> {
    return this.variantRepo.findOne({
      where: { product: { id } },
    });
  }

  async deleteByProductId(id: number) {
    return await this.variantRepo.delete({ product: { id } });
  }

  async filterProductVariant(query: FilterProductVariantDto) {
    const { search, product, minPrice, maxPrice, page = 1, limit = 10 } = query;
    const qb = this.variantRepo.createQueryBuilder('pv');

    if (search) {
      qb.andWhere('(LOWER(pv.variant_name) LIKE LOWER(:search))', {
        search: `%${search}%`,
      });
    }

    if (product) {
      qb.andWhere('pv.productId = :productId', { productId: product });
    }

    if (minPrice) {
      qb.andWhere('pv.price_modifier >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      qb.andWhere('pv.price_modifier <= :maxPrice', { maxPrice });
    }

    qb.orderBy('pv.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
