import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantController } from './product-variant.controller';
import { ProductVariantService } from './product-variant.service';
import { ProductVariantRepository } from './product-variant.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariant]), ProductsModule],
  controllers: [ProductVariantController],
  providers: [ProductVariantService, ProductVariantRepository],
})
export class ProductVariantModule {}
