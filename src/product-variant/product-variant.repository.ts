import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/database/abstract.repository';
import { Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductVariantRepository extends BaseRepository<ProductVariant> {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {
    super(variantRepo);
  }
}
