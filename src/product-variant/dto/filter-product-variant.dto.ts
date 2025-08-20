import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class FilterProductVariantDto {
  @IsOptional()
  @ApiProperty({ required: false })
  search?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  product?: number;

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
