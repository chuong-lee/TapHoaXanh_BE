import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProfileDto {
  @Expose()
  name: string;

  @Expose()
  phone: string;

  @Expose()
  email: string;

  @Expose()
  image: string;
}
