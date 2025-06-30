import { BaseRepository } from 'src/database/abstract.repository';
import { Product } from './entities/product.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

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
}
