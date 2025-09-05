import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryRatingDto {
  @ApiPropertyOptional({
    description: 'Product ID to filter ratings',
    example: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  product_id?: number;

  @ApiPropertyOptional({
    description: 'User ID to filter ratings',
    example: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  user_id?: number;

  @ApiPropertyOptional({
    description: 'Rating value to filter (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Search in comments',
    example: 'tốt'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'createdAt',
    enum: ['createdAt', 'rating', 'updatedAt']
  })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'rating' | 'updatedAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC']
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
