import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class FilterVoucherDto {
  @IsOptional()
  @ApiProperty({ required: false })
  search!: string;

  @IsOptional()
  @ApiProperty({ required: false })
  start_date?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  end_date?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  is_used?: boolean;

  @IsOptional()
  @ApiProperty({ required: false })
  page?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  limit?: number;
}
