import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    description: 'File cần upload (jpg, jpeg, png, gif, webp)',
    type: 'string',
    format: 'binary',
    example: 'image.jpg',
  })
  file: any;
}
