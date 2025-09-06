import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductVariantRepository {
  constructor(
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
  ) {}

  async create(data: Partial<ProductVariant>): Promise<ProductVariant> {
    return this.productVariantRepository.create(data);
  }

  async save(data: ProductVariant): Promise<ProductVariant> {
    return this.productVariantRepository.save(data);
  }

  async findAll(): Promise<ProductVariant[]> {
    return this.productVariantRepository.find();
  }

  async findById(id: number): Promise<ProductVariant | null> {
    return this.productVariantRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.productVariantRepository.delete(id);
  }
}
