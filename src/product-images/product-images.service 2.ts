import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from 'src/products/products.repository';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { ProductImagesRepository } from './prduct-images.repository';

@Injectable()
export class ProductImagesService {
  constructor(
    private readonly productImagesRepository: ProductImagesRepository,
    private readonly productRepository: ProductRepository,
  ) {}
  async create(createProductImageDto: CreateProductImageDto) {
    const product = await this.productRepository.findById(createProductImageDto.productId);
    if (!product) throw new NotFoundException('San pham khong ton tai');
    const productImage = await this.productImagesRepository.create({ ...createProductImageDto, product });
    return await this.productImagesRepository.save(productImage);
  }

  findAll() {
    return `This action returns all productImages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productImage`;
  }

  update(id: number, updateProductImageDto: UpdateProductImageDto) {
    return `This action updates a #${id} productImage`;
  }

  remove(id: number) {
    return `This action removes a #${id} productImage`;
  }
}
