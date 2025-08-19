import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Áo thun nam' })
  name: string;

  @ApiProperty({ example: 150000 })
  price: number;

  @ApiProperty({ example: 50 })
  discount: number;

  @ApiProperty({ type: 'string', format: 'binary' })
  images: string; // field upload file
  @ApiProperty({ example: 10 })
  slug: string;
  @ApiProperty({ example: 'mã code' })
  barcode: string;

  @ApiProperty({ example: '2028-02-01' })
  expiry_date: Date;

  @ApiProperty({ example: 'Nguồn gốc' })
  origin: string;

  @ApiProperty({ example: 10.05 })
  weight_unit: string;

  @ApiProperty({ example: 'Mô tả sản phẩm' })
  description: string;

  @ApiProperty({ example: 10 })
  quantity: number;

  @ApiProperty({ example: 1 })
  categoryId: number;

  @ApiProperty({ example: 1 })
  brandId: number;

  @ApiProperty({ example: 10 })
  purchase: number;
}
