import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from 'src/products/products.repository';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariantRepository } from './product-variant.repository';

@Injectable()
export class ProductVariantService {
  constructor(
    private readonly variantRepository: ProductVariantRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async create(dto: CreateProductVariantDto) {
    const product = await this.productRepository.findById(dto.productId);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    const variant = this.variantRepository.create(dto);
    return await this.variantRepository.save(variant);
  }

  async findProductVariantsById(productId: number) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    return product;
  }

  async findAll() {
    return await this.variantRepository.findAll();
  }

  async update(id: number, dto: UpdateProductVariantDto) {
    const variant = await this.variantRepository.findById(id);
    if (!variant) throw new NotFoundException('Biến thể không tồn tại');
    const updatedVariant = this.variantRepository.create({
      ...variant,
      ...dto,
    });

    return await this.variantRepository.save(updatedVariant);
  }

  async remove(id: number) {
    const variant = await this.variantRepository.findById(id);
    if (!variant) throw new NotFoundException('Biến thể không tồn tại');
    await this.variantRepository.delete(id);
    return { message: 'Xóa thành công' };
  }
}
