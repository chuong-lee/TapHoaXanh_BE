import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Users } from '../entities/users.entity';
import { IUsersService } from '../interfaces/iusers-service.interface';
import { IUsersRepository } from '../interfaces/iusers-repository.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import { ProfileDto } from '../dto/profile-user.dto';

@Injectable()
export class UsersService implements IUsersService {
  constructor(private readonly _usersRepository: IUsersRepository) {}

  // async createUser(registerDto: RegisterAuthDto): Promise<Users> {
  //   const existing = await this._usersRepository.findByEmail(registerDto.email);
  //   if (existing) throw new ConflictException('Email đã tồn tại');
  //   const hashedPassword = await bcrypt.hash(registerDto.password, 10);
  //   return this._usersRepository.createUser({ ...registerDto, password: hashedPassword, role: 'user' });
  // }
  async findAll(): Promise<Users[]> {
    return await this._usersRepository.findAll();
  }
  async findByEmail(email: string): Promise<Users | null> {
    return await this._usersRepository.findByEmail(email);
  }

  async updatePassword(email: string, newPassword: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('Email không tồn tại');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this._usersRepository.updatePassword(email, hashedPassword);
    return true;
  }

  async findById(id: number): Promise<Users | null> {
    const user = await this._usersRepository.findById(id);

    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return user;
  }

  async updateUserInformation(id: number, updateUserDto: UpdateUserDto): Promise<Users | null> {
    await this.findById(id);
    return await this._usersRepository.updateUser(id, updateUserDto);
  }

  async getUserInformation(id: number): Promise<ProfileDto | null> {
    const user = await this._usersRepository.findById(id);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    console.log(user, 'asd1');
    console.log(plainToInstance(ProfileDto, user), 'asd2');
    return plainToInstance(ProfileDto, user);
  }
}
