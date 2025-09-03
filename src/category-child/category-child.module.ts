// src/category-child/category-child.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryChild } from './entities/category-child.entity';
import { Category } from '../category/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { CategoryChildController } from './category-child.controller';
import { CategoryChildService } from './category-child.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryChild, Category, Product])],
  controllers: [CategoryChildController],
  providers: [CategoryChildService],
})
export class CategoryChildModule {}
