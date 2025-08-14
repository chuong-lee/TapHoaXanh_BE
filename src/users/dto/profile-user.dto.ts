import { Exclude, Expose } from 'class-transformer';
import { MinLength } from 'class-validator';

@Exclude()
export class ProfileDto {
  @Expose()
  name: string;

  @Expose()
  @MinLength(10, { message: 'Số điện thoại phải có ít nhất 10 ký tự' })
  phone: string;

  @Expose()
  email: string;

  @Expose()
  image: string;
}
