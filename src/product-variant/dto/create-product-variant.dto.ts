import { ApiProperty } from '@nestjs/swagger';

export class CreateProductVariantDto {
  @ApiProperty({ example: 'fish' })
  variant_name!: string;

  @ApiProperty({ example: '50000' })
  price_modifier!: number;

  @ApiProperty({ example: '20' })
  stock!: number;

  @ApiProperty({ example: '1' })
  productId!: number; // Foreign key to associate with a product
}
