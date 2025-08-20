import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { BrandRepository } from 'src/brand/brand.repsitory';
import { CategoryRepository } from 'src/category/categories.reposirory';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from './products.repository';
import { ProductFilterDto } from './dto/Filter-product.dto';
import * as fs from 'fs';
import * as util from 'util';
import { join } from 'path';
import { deleteFileIfExists } from 'src/utils/deleteImages';
const writeFile = util.promisify(fs.writeFile);
@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async handleSingleFileUpload(file: Express.Multer.File, folderName: string) {
    try {
      const uploadDir = join(process.cwd(), 'uploads', folderName);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = Date.now() + '-' + file.originalname;
      const filePath = join(uploadDir, filename);

      await writeFile(filePath, file.buffer);

      return {
        filename,
        path: `/uploads/${folderName}/${filename}`,
      };
    } catch (error) {
      console.error('Upload lỗi:', error);
      throw new InternalServerErrorException('Không thể upload file');
    }
  }

  async create(createProductDto: CreateProductDto, image: Express.Multer.File) {
    const product = this.productRepository.create(createProductDto);
    const existProductByCode = await this.productRepository.findOneByField('barcode', createProductDto.barcode);
    if (existProductByCode) throw new BadRequestException('Mã code này đã được sử dụng');

    const existCategory = await this.categoryRepository.findById(createProductDto.categoryId);
    if (!existCategory) throw new NotFoundException('Danh mục này không tồn tại');
    product.category = existCategory;

    const existBrand = await this.brandRepository.findById(createProductDto.brandId);
    if (!existBrand) throw new NotFoundException('Thương hiệu này không tồn tại');
    product.brand = existBrand;

    const uploadedImage = await this.handleSingleFileUpload(image, 'products');
    product.images = uploadedImage.path;

    return await this.productRepository.save(product);
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
    const existProduct = await this.productRepository.findOne(id);
    if (!existProduct) throw new NotFoundException('Sản phẩm không tồn tại');
    return existProduct;
  }

  async update(id: number, updateProductDto: UpdateProductDto, file?: Express.Multer.File) {
    const existProduct = await this.productRepository.findById(id);
    if (!existProduct) throw new NotFoundException('Sản phẩm không tồn tại');

    if (updateProductDto.barcode) {
      const idProduct = await this.productRepository.findOneByField('barcode', updateProductDto.barcode);
      if (idProduct && idProduct.id !== id) throw new BadRequestException('Mã code này đã được sử dụng');
    }

    if (file) {
      deleteFileIfExists(existProduct.images);
      const uploaded = await this.handleSingleFileUpload(file, 'products');
      updateProductDto.images = uploaded.path;
    }

    const updateProduct = this.productRepository.create({
      ...existProduct,
      ...updateProductDto,
    });

    await this.productRepository.save(updateProduct);

    return {
      message: 'Cập nhật thành công',
      data_update: updateProduct,
    };
  }

  async remove(id: number) {
    const existProduct = await this.productRepository.findById(id);
    if (!existProduct) throw new NotFoundException('Sản phẩm không tồn tại');

    deleteFileIfExists(existProduct.images);

    await this.productRepository.delete(id);

    return { message: 'Xóa thành công' };
  }

  async removeByCategoryId(id: number) {
    const existProduct = await this.productRepository.findByCategory(id);
    if (!existProduct) throw new NotFoundException('Sản phẩm không tồn tại');

    existProduct.map((item) => deleteFileIfExists(item.images));

    await this.productRepository.deleteByCategoryId(id);

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
