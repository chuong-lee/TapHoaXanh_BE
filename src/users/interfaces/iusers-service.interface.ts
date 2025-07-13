import { Users } from '../entities/users.entity';

export abstract class IUsersService {
  abstract findByEmail(email: string): Promise<Users | null>;
  abstract updatePassword(email: string, newPassword: string): Promise<boolean>;
  abstract findById(id: number): Promise<Users | null>;
  abstract findAll(): Promise<Users[]>;
}
