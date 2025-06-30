import { Module } from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { ProductImagesController } from './product-images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImage } from './entities/product-image.entity';
import { ProductImagesRepository } from './prduct-images.repository';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductImage]), ProductsModule],
  controllers: [ProductImagesController],
  providers: [ProductImagesService, ProductImagesRepository],
})
export class ProductImagesModule {}
