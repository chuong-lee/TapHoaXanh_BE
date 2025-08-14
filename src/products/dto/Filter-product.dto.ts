import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ProductFilterDto {
  @IsOptional()
  @ApiProperty({ required: false })
  search?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  image?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  brand?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  category?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  minPrice?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  maxPrice?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  page?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  limit?: number;
}
