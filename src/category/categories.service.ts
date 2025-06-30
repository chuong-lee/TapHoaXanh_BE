import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './categories.reposirory';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Kiểm tra category đã tồn tại (giả sử kiểm tra theo tên)
    const existCategory = await this.categoryRepository.findByName(createCategoryDto.name);
    if (existCategory) {
      throw new BadRequestException('Tên danh mục đã tồn tại');
    }
    const category = this.categoryRepository.create(createCategoryDto);
    const saveCategory = await this.categoryRepository.save(category);
    return saveCategory;
  }

  async findAll() {
    return await this.categoryRepository.findAll();
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Kiểm tra danh mục tồn tại
    const existCategory = await this.categoryRepository.findById(id);
    if (!existCategory) throw new NotFoundException('Danh mục không tồn tại');

    // Kiểm tra tên mới đã tồn tại ở category khác chưa (nếu sửa tên)
    if (updateCategoryDto.name) {
      const categoryByName = await this.categoryRepository.findByName(updateCategoryDto.name);
      if (categoryByName && categoryByName.id !== id) {
        throw new BadRequestException('Tên danh mục đã tồn tại');
      }
    }

    // Cập nhật
    const updateCategory = this.categoryRepository.create({
      ...existCategory,
      ...updateCategoryDto,
    });
    //lưu
    const savedCategory = await this.categoryRepository.save(updateCategory);

    return {
      message: 'Cập nhật thành công',
      data_update: savedCategory,
    };
  }

  async remove(id: number) {
    // kiểm tra tồn tại trước khi xóa
    const existCategory = await this.categoryRepository.findById(id);
    if (!existCategory) throw new NotFoundException('Danh mục không tồn tại');
    await this.categoryRepository.delete(id); // Giả sử có hàm này
    return { message: 'Xóa thành công' };
  }

  async restore(id: number) {
    await this.categoryRepository.update(id, { deletedAt: null });
    return { message: 'Khôi phục thành công' };
  }
}
