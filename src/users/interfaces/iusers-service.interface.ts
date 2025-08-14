import { Users } from '../entities/users.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdatePasswordDto } from '../dto/updatePassword-user.dto';
import { ProfileDto } from '../dto/profile-user.dto';

export abstract class IUsersService {
  abstract findByEmail(email: string): Promise<Users | null>;
  abstract updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto): Promise<boolean>;
  abstract findById(id: number): Promise<Users | null>;
  abstract findAll(): Promise<Users[]>;
  abstract updateUserInformation(id: number, updateUserDto: UpdateUserDto): Promise<Users | null>;
  abstract getUserInformation(id: number): Promise<ProfileDto | null>;
}
