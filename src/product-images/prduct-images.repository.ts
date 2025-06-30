import { BaseRepository } from 'src/database/abstract.repository';
import { ProductImage } from './entities/product-image.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductImagesRepository extends BaseRepository<ProductImage> {
  constructor(
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
  ) {
    super(productImagesRepository);
  }
}
