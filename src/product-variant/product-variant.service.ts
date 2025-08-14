import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from 'src/products/products.repository';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariantRepository } from './product-variant.repository';
import { FilterProductVariantDto } from './dto/filter-product-variant.dto';

@Injectable()
export class ProductVariantService {
  constructor(
    private readonly variantRepository: ProductVariantRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async create(dto: CreateProductVariantDto) {
    const variant = this.variantRepository.create(dto);
    const existProduct = await this.productRepository.findById(dto.productId);
    if (!existProduct) throw new NotFoundException('Sản phẩm không tồn tại');
    variant.product = existProduct;
    return await this.variantRepository.save(variant);
  }

  async findProductVariantsById(productId: number) {
    const product = await this.variantRepository.findOne(productId);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    return product;
  }

  async findAll() {
    return await this.variantRepository.findAll();
  }

  async getProductVariantsWithPagination(query: FilterProductVariantDto) {
    return await this.variantRepository.filterProductVariant(query);
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
    await this.variantRepository.delete(id); // Giả sử có hàm này
    return { message: 'Xóa thành công' };
  }
}
