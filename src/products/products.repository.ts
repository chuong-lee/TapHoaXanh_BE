import { BaseRepository } from 'src/database/abstract.repository';
import { Product } from './entities/product.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductFilterDto } from './dto/Filter-product.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    super(productRepository);
  }

  async findByCode(barcode: string) {
    return this.productRepository.findOne({ where: { barcode } as FindOptionsWhere<Product> });
  }

  async findByCategory(categoryId: number) {
    return this.productRepository.find({
      where: { category: { id: categoryId } } as FindOptionsWhere<Product>,
    });
  }
  async findOne(id: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['category', 'brand'],
        select: [
          'id', 'createdAt', 'updatedAt', 'deletedAt', 'name', 'price', 
          'discount', 'images', 'slug', 'barcode', 'expiry_date', 
          'origin', 'weight_unit', 'description', 'quantity', 'purchase'
        ]
      });
      if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }
  async filterProducts(query: ProductFilterDto) {
    const { search, brand, category, minPrice, maxPrice, page = 1, limit = 10 } = query;
    const qb = this.productRepository.createQueryBuilder('product');

    if (search) {
      qb.andWhere('(LOWER(product.name) LIKE LOWER(:search))', {
        search: `%${search}%`,
      });
    }

    if (brand) {
      qb.leftJoin('product.brand', 'brand');
      qb.andWhere('LOWER(brand.name) LIKE LOWER(:brand)', { brand });
    }

    if (category) {
      qb.andWhere('product.category = :category', { category });
    }

    if (minPrice) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    qb.skip((page - 1) * limit).take(limit);

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

  async findAllWithDetails() {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')

      .select([
        'product.id',
        'product.createdAt',
        'product.updatedAt',
        'product.deletedAt',
        'product.name',
        'product.price',
        'product.discount',
        'product.images',
        'product.slug',
        'product.barcode',
        'product.expiry_date',
        'product.origin',
        'product.weight_unit',
        'product.description',
        'product.quantity',
        'product.purchase',
        'category.id',
        'category.name',
        'brand.id',
        'brand.name',

      ])
      .getMany();
  }

  async findOneWithDetails(id: number): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['category', 'brand'],
      select: [
        'id', 'createdAt', 'updatedAt', 'deletedAt', 'name', 'price', 
        'discount', 'images', 'slug', 'barcode', 'expiry_date', 
        'origin', 'weight_unit', 'description', 'quantity', 'purchase'
      ]
    });
  }
}
