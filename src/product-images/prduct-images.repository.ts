import { BaseRepository } from 'src/database/abstract.repository';
import { ProductImage } from './entities/product-image.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class ProductImagesRepository extends BaseRepository<ProductImage> {
  constructor(
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
  ) {
    super(productImagesRepository);
  }

  async getAllProductImages() {
    const products = await this.productImagesRepository
      .createQueryBuilder('product_images')
      .innerJoin(Product, 'product', 'product_images.productId = product.id')
      .select(['product_images.id AS id', 'product.name AS name', 'product_images.image_url AS image_url'])
      .getRawMany();

    return products;
  }
}
