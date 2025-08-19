import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/Filter-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Public } from '../../public.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiConsumes('multipart/form-data') // Cho phép swagger gửi form-data
  @ApiBody({ type: CreateProductDto })
  @UseInterceptors(FileInterceptor('images')) // 'image' là tên field trong form-data
  async create(@Body() createProductDto: CreateProductDto, @UploadedFile() file: Express.Multer.File) {
    return this.productsService.create(createProductDto, file);
  }

  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Public()
  @Get('search')
  async Search(@Query() query: ProductFilterDto) {
    return this.productsService.filterProducts(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productsService.productDetail(id);
  }

  @Public()
  @Get('cate/:id')
  findByCategory(@Param('id') id: number) {
    return this.productsService.findByCategory(id);
  }

  @Patch('restore/:id')
  restore(@Param('id') id: number) {
    return this.productsService.restore(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('images')) // 'images' là tên field file trong form-data
  update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File, // ? vì file có thể không gửi
  ) {
    return this.productsService.update(id, updateProductDto, file);
  }

  @Delete('by-cate/:id')
  removeByCategoryId(@Param('id') id: number) {
    return this.productsService.removeByCategoryId(+id);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.productsService.remove(+id);
  }
}
