import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from 'src/brand/brand.repsitory';
import { CategoryRepository } from 'src/category/categories.reposirory';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from './products.repository';
import { ProductFilterDto } from './dto/Filter-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly brandRepository: BrandRepository,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    const existCategory = await this.categoryRepository.findById(createProductDto.categoryId);
    if (!existCategory) throw new NotFoundException('Danh mục không tồn tại');
    product.category = existCategory;
    const existBrand = await this.brandRepository.findById(createProductDto.brandId);
    if (!existBrand) throw new NotFoundException('Thương hiệu không tồn tại');
    product.brand = existBrand;
    const saveProduct = await this.productRepository.save(product); // thêm await
    return saveProduct;
  }

  async findAll() {
    return await this.productRepository.findAll();
  }

  // show sp theo danh muc
  async findByCategory(categoryId: number) {
    const existCategory = await this.categoryRepository.findById(categoryId);
    if (!existCategory) throw new NotFoundException('Danh mục không tồn tại');
    return await this.productRepository.findByCategory(categoryId);
  }

  // show sp theo id
  async productDetail(id: number) {
    const existProduct = await this.productRepository.findById(id);
    if (!existProduct) throw new NotFoundException('Sản phẩm không tồn tại');
    return existProduct;
  }

  async findOne(id: number) {
    const existProduct = await this.productRepository.findById(id);
    if (!existProduct) throw new NotFoundException('Sản phẩm không tồn tại');
    return existProduct;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const existProduct = await this.productRepository.findById(id);
    if (!existProduct) throw new NotFoundException('Sản phẩm không tồn tại');

    if (updateProductDto.barcode) {
      const productWithSameBarcode = await this.productRepository.findByCode(updateProductDto.barcode);
      if (productWithSameBarcode && productWithSameBarcode.id !== id) {
        throw new BadRequestException('Mã code sản phẩm đã tồn tại');
      }
    }

    // Chỉ cập nhật các trường cho phép
    Object.assign(existProduct, updateProductDto);

    await this.productRepository.save(existProduct);

    return {
      message: 'Cập nhật thành công',
      data_update: existProduct,
    };
  }

  async remove(id: number) {
    // kiểm tra tồn tại trước khi xóa
    const existProduct = await this.productRepository.findById(id);
    if (!existProduct) throw new NotFoundException('Sản phẩm không tồn tại');
    await this.productRepository.delete(id); // Giả sử có hàm này
    return { message: 'Xóa thành công' };
  }

  async restore(id: number) {
    await this.productRepository.update(id, { deletedAt: null });
    return { message: 'Khôi phục thành công' };
  }
  async filterProducts(query: ProductFilterDto) {
    return this.productRepository.filterProducts(query);
  }
}
