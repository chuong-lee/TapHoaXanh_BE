import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../products/products.repository';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariantRepository } from './product-variant.repository';
import { FilterProductVariantDto } from './dto/filter-product-variant.dto';
import { ICloudinaryService } from '../cloudinary/interfaces/icloudinary-service.interface';

@Injectable()
export class ProductVariantService {
  constructor(
    private readonly variantRepository: ProductVariantRepository,
    private readonly productRepository: ProductRepository,
    private readonly cloudinaryService: ICloudinaryService,
  ) {}

  async create(dto: CreateProductVariantDto, image: Express.Multer.File) {
    const variant = this.variantRepository.create(dto);
    const existProduct = await this.productRepository.findById(dto.productId);
    if (!existProduct) throw new NotFoundException('Sản phẩm không tồn tại');
    variant.product = existProduct;

    const cloudinaryResult = await this.cloudinaryService.uploadFile(image, {
      fileType: 'product',
    });

    if (!cloudinaryResult) {
      throw new InternalServerErrorException('Upload ảnh thất bại');
    }
    variant.image_url = cloudinaryResult.secure_url;
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

  async update(id: number, dto: UpdateProductVariantDto, file?: Express.Multer.File) {
    const variant = await this.variantRepository.findById(id);
    if (!variant) throw new NotFoundException('Biến thể không tồn tại');

    if (file) {
      if (variant.image_url) this.cloudinaryService.deleteFile(variant.image_url);
      const uploaded = await this.cloudinaryService.uploadFile(file, {
        fileType: 'product',
      });
      variant.image_url = uploaded.secure_url;
    }
    const updatedVariant = this.variantRepository.create({
      ...variant,
      ...dto,
    });

    return await this.variantRepository.save(updatedVariant);
  }

  async removeProductVariantByProductId(productId: number) {
    const variants = await this.variantRepository.findOneByProductId(productId);
    if (!variants) {
      throw new NotFoundException('Không tìm thấy biến thể nào của sản phẩm này');
    }

    this.cloudinaryService.deleteFile(variants.image_url);

    await this.variantRepository.deleteByProductId(productId); // xóa theo điều kiện
    return { message: 'Xóa thành công tất cả biến thể' };
  }

  async remove(id: number) {
    const variant = await this.variantRepository.findById(id);
    if (!variant) throw new NotFoundException('Biến thể không tồn tại');
    this.cloudinaryService.deleteFile(variant.image_url);
    await this.variantRepository.delete(id);
    return { message: 'Xóa thành công' };
  }
}
