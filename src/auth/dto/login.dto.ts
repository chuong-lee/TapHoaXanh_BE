import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({ example: 'phongndps37996@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1hmad0os' })
  @MinLength(8, { message: 'Mật khẩu không thể dưới 8 ký tự.' })
  password: string;
}
