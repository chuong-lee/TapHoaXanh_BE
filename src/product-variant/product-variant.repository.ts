import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/database/abstract.repository';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductVariantRepository extends BaseRepository<ProductVariant> {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {
    super(variantRepo);
  }

  async findByProduct(productId: number) {
    return this.variantRepo.find({
      where: {
        product: { id: productId },
      } as FindOptionsWhere<ProductVariant>,
      relations: ['product'],
    });
  }

  async findByVariantName(name: string) {
    return this.variantRepo.findOne({
      where: { variant_name: name } as FindOptionsWhere<ProductVariant>,
    });
  }
}
