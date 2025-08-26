import { ApiProperty } from '@nestjs/swagger';

export class UploadMultipleFilesDto {
  @ApiProperty({
    description: 'Danh sách files cần upload (tối đa 10 files)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    example: ['image1.jpg', 'image2.png'],
  })
  files!: any[];
}
