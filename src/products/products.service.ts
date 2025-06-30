import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from 'src/brand/brand.repsitory';
import { CategoryRepository } from 'src/category/categories.reposirory';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from './products.repository';

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
    if (!existCategory) throw new NotFoundException('Cate không tồn tại');
    product.category = existCategory;
    const existBrand = await this.brandRepository.findById(createProductDto.brandId);
    if (!existBrand) throw new NotFoundException('brand không tồn tại');
    product.brand = existBrand;
    const saveProduct = this.productRepository.save(product);
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
  

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // b1: kiểm tra sản phẩm tồn tại
    const existProduct = await this.productRepository.findById(id);
    if (updateProductDto.barcode) {
      const idProduct = await this.productRepository.findByCode(updateProductDto.barcode);
      if (idProduct) throw new BadRequestException('mã code sản phẩm đã tồn tại');
    }

    if (!existProduct) throw new NotFoundException('san pham k ton tai');

    //b2 cap nhat
    const updateProduct = this.productRepository.create({
      ...existProduct,
      ...updateProductDto,
    });
    //b3 luu lai
    await this.productRepository.save(updateProduct);
    //b4 hien thong bao
    const data = {
      message: 'cập nhật thành công',
      data_update: updateProduct,
    };
    return data;
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
}
