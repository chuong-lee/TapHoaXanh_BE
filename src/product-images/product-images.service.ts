import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ProductRepository } from 'src/products/products.repository';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { ProductImagesRepository } from './prduct-images.repository';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import * as fs from 'fs';
import * as util from 'util';
import { dirname, join } from 'path';

const writeFile = util.promisify(fs.writeFile);

@Injectable()
export class ProductImagesService {
  constructor(
    private readonly productImagesRepository: ProductImagesRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async handleFileUpload(files: Express.Multer.File[], folderName: string) {
    try {
      const uploadDir = join(__dirname, '..', '..', 'uploads', folderName);
      console.log('📂 Saving files to:', uploadDir);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('✅ Folder created');
      }

      const savedFiles = [];

      for (const file of files) {
        const filename = Date.now() + '-' + file.originalname;
        const filePath = join(uploadDir, filename);

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

    const uploadResult = await this.handleFileUpload(images, product.id.toString());

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
    if (!productImage) throw new NotFoundException('Hình ảnh sản phẩm không tồn tại');
    return productImage;
  }

  async update(id: number, updateProductImageDto: UpdateProductImageDto) {
    const productImage = await this.productImagesRepository.findById(id);
    if (!productImage) throw new NotFoundException('Hình ảnh sản phẩm không tồn tại');
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

  async remove(id: number) {
    const productImage = await this.productImagesRepository.findById(id);
    if (!productImage) throw new NotFoundException('Hình ảnh sản phẩm không tồn tại');

    const relativePath = productImage.image_url.startsWith('/')
      ? productImage.image_url.slice(1)
      : productImage.image_url;

    const filePath = join(__dirname, '..', '..', relativePath);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Đã xóa file: ${filePath}`);

        const folderPath = dirname(filePath);

        if (folderPath.endsWith('uploads')) return;

        const files = fs.readdirSync(folderPath);
        if (files.length === 0) {
          fs.rmdirSync(folderPath);
          console.log(`Đã xóa folder rỗng: ${folderPath}`);
        }
      }
    } catch (err) {
      console.error(`Không thể xoá file hoặc folder:`, err);
    }

    await this.productImagesRepository.delete(id);

    return {
      message: `Xoá hình ảnh sản phẩm thành công`,
    };
  }
}
