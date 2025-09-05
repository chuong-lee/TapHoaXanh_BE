import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  HttpStatus,
  ParseIntPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { QueryRatingDto } from './dto/query-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';
import { Rating } from './entities/rating.entity';
import { PaginationResult } from '../interface/IPagination';

@ApiTags('Rating - Đánh giá sản phẩm')
@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đánh giá mới cho sản phẩm' })
  @ApiBody({ type: CreateRatingDto })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Đánh giá được tạo thành công',
    type: RatingResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Bạn đã đánh giá sản phẩm này rồi' 
  })
  create(@Body() createRatingDto: CreateRatingDto): Promise<Rating> {
    return this.ratingService.create(createRatingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả đánh giá với phân trang và lọc' })
  @ApiQuery({ type: QueryRatingDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Danh sách đánh giá',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/RatingResponseDto' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            lastPage: { type: 'number' }
          }
        }
      }
    }
  })
  findAll(@Query() query: QueryRatingDto): Promise<PaginationResult<Rating>> {
    return this.ratingService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Lấy thống kê tổng quan về đánh giá' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Thống kê đánh giá' 
  })
  getStatistics() {
    return this.ratingService.getRatingStatistics();
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Lấy top sản phẩm được đánh giá cao nhất' })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Số lượng sản phẩm (mặc định: 10)' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Top sản phẩm được đánh giá cao' 
  })
  getTopRatedProducts(@Query('limit') limit: number = 10) {
    return this.ratingService.getTopRatedProducts(limit);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Lấy đánh giá theo sản phẩm' })
  @ApiParam({ name: 'productId', description: 'ID sản phẩm' })
  @ApiQuery({ type: QueryRatingDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Đánh giá của sản phẩm',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/RatingResponseDto' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            lastPage: { type: 'number' }
          }
        }
      }
    }
  })
  getRatingsByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: QueryRatingDto
  ): Promise<PaginationResult<Rating>> {
    return this.ratingService.getRatingsByProduct(productId, query);
  }

  @Get('product/:productId/average')
  @ApiOperation({ summary: 'Lấy điểm đánh giá trung bình của sản phẩm' })
  @ApiParam({ name: 'productId', description: 'ID sản phẩm' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Điểm đánh giá trung bình và số lượng đánh giá' 
  })
  getAverageRatingByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.ratingService.getAverageRatingByProduct(productId);
  }

  @Get('product/:productId/distribution')
  @ApiOperation({ summary: 'Lấy phân bố đánh giá của sản phẩm' })
  @ApiParam({ name: 'productId', description: 'ID sản phẩm' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Phân bố đánh giá theo từng mức điểm' 
  })
  getRatingDistributionByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.ratingService.getRatingDistributionByProduct(productId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy đánh giá theo user' })
  @ApiParam({ name: 'userId', description: 'ID user' })
  @ApiQuery({ type: QueryRatingDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Đánh giá của user',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/RatingResponseDto' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            lastPage: { type: 'number' }
          }
        }
      }
    }
  })
  getRatingsByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: QueryRatingDto
  ): Promise<PaginationResult<Rating>> {
    return this.ratingService.getRatingsByUser(userId, query);
  }

  @Get('check/:userId/:productId')
  @ApiOperation({ summary: 'Kiểm tra user đã đánh giá sản phẩm chưa' })
  @ApiParam({ name: 'userId', description: 'ID user' })
  @ApiParam({ name: 'productId', description: 'ID sản phẩm' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Kết quả kiểm tra' 
  })
  checkUserHasRatedProduct(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('productId', ParseIntPipe) productId: number
  ) {
    return this.ratingService.checkUserHasRatedProduct(userId, productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một đánh giá' })
  @ApiParam({ name: 'id', description: 'ID đánh giá' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Thông tin đánh giá',
    type: RatingResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Không tìm thấy đánh giá' 
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Rating> {
    return this.ratingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật đánh giá' })
  @ApiParam({ name: 'id', description: 'ID đánh giá' })
  @ApiBody({ type: UpdateRatingDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Đánh giá được cập nhật thành công',
    type: RatingResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Không tìm thấy đánh giá' 
  })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateRatingDto: UpdateRatingDto
  ): Promise<Rating> {
    return this.ratingService.update(id, updateRatingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đánh giá' })
  @ApiParam({ name: 'id', description: 'ID đánh giá' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Đánh giá được xóa thành công' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Không tìm thấy đánh giá' 
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ratingService.remove(id);
  }
}
