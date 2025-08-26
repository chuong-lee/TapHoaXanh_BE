import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProductsModule } from '../products/products.module';
import { ProductImage } from './entities/product-image.entity';
import { ProductImagesRepository } from './prduct-images.repository';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductImage]), ProductsModule, CloudinaryModule],
  controllers: [ProductImagesController],
  providers: [ProductImagesService, ProductImagesRepository],
})
export class ProductImagesModule {}
