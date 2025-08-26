import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ description: 'Street address', required: false })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ description: 'City', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'District', required: false })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({ description: 'Ward', required: false })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiProperty({ description: 'Is default address', required: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
