import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryChild } from './entities/category-child.entity';
import { CreateCategoryChildDto } from './dto/create-category-child.dto';
import { UpdateCategoryChildDto } from './dto/update-category-child.dto';

@Injectable()
export class CategoryChildService {
  constructor(
    @InjectRepository(CategoryChild)
    private repo: Repository<CategoryChild>,
  ) {}

  create(dto: CreateCategoryChildDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  findAllWithRelations() {
    return this.repo.find({ relations: ['parentCategory', 'products'] });
  }

  findOneWithRelations(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['parentCategory', 'products'],
    });
  }

  async update(id: number, dto: UpdateCategoryChildDto) {
    await this.repo.update(id, dto);
    return this.findOneWithRelations(id);
  }

  async remove(id: number) {
    return this.repo.delete(id);
  }
}
