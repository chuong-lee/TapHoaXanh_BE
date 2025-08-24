import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarResponseDto {
  @ApiProperty({
    description: 'Trạng thái upload',
  })
  success!: boolean;

  @ApiProperty({
    description: 'Dữ liệu user sau khi cập nhật avatar',
  })
  data?: {
    id: number;
    name: string;
    email: string;
    image: string | null;
    role: string;
  };

  @ApiProperty({
    description: 'Thông báo kết quả',
  })
  message!: string;
}
