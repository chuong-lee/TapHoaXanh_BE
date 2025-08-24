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
    // Kiểm tra category
    if (createProductDto.categoryId) {
      const existCategory = await this.categoryRepository.findById(createProductDto.categoryId);
      if (!existCategory) throw new NotFoundException('Danh mục không tồn tại');
      product.category = existCategory;
    }
    // Kiểm tra brand
    if (createProductDto.brandId) {
      const existBrand = await this.brandRepository.findById(createProductDto.brandId);
      if (!existBrand) throw new NotFoundException('Thương hiệu không tồn tại');
      product.brand = existBrand;
    }
    const saveProduct = await this.productRepository.save(product);
    return saveProduct;
  }

  async findAll() {
    try {
      console.log('Fetching products...');
      const products = await this.productRepository.findAllWithDetails();
      console.log('Products found:', products.length);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // private getTestProducts() {
  //   return [
  //     {
  //       id: 1,
  //       name: 'Sản phẩm test 1',
  //       price: 25000,
  //       discount: 10,
  //       images: 'https://via.placeholder.com/300x300?text=Test+Product+1',
  //       slug: 'san-pham-test-1',
  //       barcode: 'TEST001',
  //       description: 'Sản phẩm test mẫu số 1',
  //       quantity: 100
  //     },
  //     // ... thêm 4 sản phẩm khác
  //   ];
  // }

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
    try {
      const product = await this.productRepository.findById(id);
      if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
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
