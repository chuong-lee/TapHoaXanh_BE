// src/category-child/category-child.controller.ts
import { Controller, Get, Post, Body,Param,Patch,Delete,} 
from '@nestjs/common';
import { CategoryChildService } from './category-child.service';
import { CreateCategoryChildDto } from './dto/create-category-child.dto';
import { UpdateCategoryChildDto } from './dto/update-category-child.dto';

@Controller('category-child')
export class CategoryChildController {
  constructor(private readonly service: CategoryChildService) {}

  @Post()
  create(@Body() dto: CreateCategoryChildDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAllWithRelations();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneWithRelations(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryChildDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
