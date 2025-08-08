import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ProductRepository } from 'src/products/products.repository';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { ProductImagesRepository } from './prduct-images.repository';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const writeFile = util.promisify(fs.writeFile);
@Injectable()
export class ProductImagesService {
  constructor(
    private readonly productImagesRepository: ProductImagesRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async handleFileUpload(files: Express.Multer.File[], folderName: string) {
    try {
      const uploadDir = path.join(__dirname, '..', '..', 'uploads', folderName);

      // Tạo folder nếu chưa có
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const savedFiles = [];

      for (const file of files) {
        const filename = Date.now() + '-' + file.originalname;
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, file.buffer);
        savedFiles.push({
          filename,
          path: `/uploads/${folderName}/${filename}`,
        });
      }

      return {
        message: 'Upload thành công',
        files: savedFiles,
      };
    } catch (error) {
      console.error('Upload lỗi:', error);
      throw new InternalServerErrorException('Không thể upload file');
    }
  }
  async create(createProductImageDto: CreateProductImageDto, images: Express.Multer.File[]) {
    const product = await this.productRepository.findById(createProductImageDto.productId);
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    // Gọi upload file
    const uploadResult = await this.handleFileUpload(images, product.id.toString());

    // Kiểm tra uploadResult.files có tồn tại và là array
    if (!uploadResult.files || !Array.isArray(uploadResult.files)) {
      throw new InternalServerErrorException('Upload ảnh thất bại');
    }

    const listImage = uploadResult.files.map((file) =>
      this.productImagesRepository.create({
        product: product,
        image_url: file.path,
      }),
    );

    return await this.productImagesRepository.saveMutiple(listImage);
  }

  async findAll() {
    return await this.productImagesRepository.getAllProductImages();
  }

  async findOne(id: number) {
    const productImage = await this.productImagesRepository.findById(id);
    if (!productImage) throw new NotFoundException('Hinh anh san pham khong ton tai');
    return productImage;
  }

  async update(id: number, updateProductImageDto: UpdateProductImageDto) {
    const productImage = await this.productImagesRepository.findById(id);
    if (!productImage) throw new NotFoundException(' Hình ảnh sản phẩm không tồn tại');
    if (updateProductImageDto.productId) {
      const product = await this.productRepository.findById(updateProductImageDto.productId);
      if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    }
    const updatedImage = this.productImagesRepository.create({
      ...productImage,
      ...updateProductImageDto,
    });
    return await this.productImagesRepository.save(updatedImage);
  }

  remove(id: number) {
    return `This action removes a #${id} productImage`;
  }
}
