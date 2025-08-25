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
import { ProductVariantService } from './product-variant.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { FilterProductVariantDto } from './dto/filter-product-variant.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('product-variant')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  @Post()
  @ApiConsumes('multipart/form-data') // Cho phép swagger gửi form-data
  @ApiBody({ type: CreateProductVariantDto })
  @UseInterceptors(FileInterceptor('image_url'))
  create(@Body() createProductVariantDto: CreateProductVariantDto, @UploadedFile() file: Express.Multer.File) {
    return this.productVariantService.create(createProductVariantDto, file);
  }

  @Get()
  findAll() {
    return this.productVariantService.findAll();
  }

  @Get('search')
  getProductVariantsWithPagination(@Query() query: FilterProductVariantDto) {
    return this.productVariantService.getProductVariantsWithPagination(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productVariantService.findProductVariantsById(+id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('images')) // 'images' là tên field file trong form-data
  update(
    @Param('id') id: number,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
    @UploadedFile() file?: Express.Multer.File, // ? vì file có thể không gửi
  ) {
    return this.productVariantService.update(+id, updateProductVariantDto, file);
  }

  @Delete('/by-product/:id')
  removeProductVariantByProductId(@Param('id') id: string) {
    return this.productVariantService.removeProductVariantByProductId(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productVariantService.remove(+id);
  }
}
