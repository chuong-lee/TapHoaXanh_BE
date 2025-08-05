import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductRepository } from 'src/products/products.repository';
import { Repository } from 'typeorm';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    private readonly productRepository: ProductRepository,
  ) {}

  async create(dto: CreateProductVariantDto) {
    const product = await this.productRepository.findById(dto.productId);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    const variant = this.variantRepo.create({
      variant_name: dto.variant_name,
      price_modifier: dto.price_modifier,
      stock: dto.stock,
      product,
    });

    return await this.variantRepo.save(variant);
  }

  async findByProduct(productId: number) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    return await this.variantRepo.find({
      where: { product: { id: productId } },
      relations: ['product'],
    });
  }

  async update(id: number, dto: UpdateProductVariantDto) {
    const variant = await this.variantRepo.findOne({ where: { id }, relations: ['product'] });
    if (!variant) throw new NotFoundException('Biến thể không tồn tại');

    const updated = this.variantRepo.merge(variant, dto);
    return await this.variantRepo.save(updated);
  }

  async remove(id: number) {
    const variant = await this.variantRepo.findOneBy({ id });
    if (!variant) throw new NotFoundException('Biến thể không tồn tại');
    return await this.variantRepo.remove(variant);
  }
}
