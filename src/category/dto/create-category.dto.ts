import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'cá tươi' })
  name: string;

  @ApiProperty({ example: 'ca-tuoi' })
  slug?: string;

  @ApiProperty({ example: 1 })
  parent_id: number;
}
