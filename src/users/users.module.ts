import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { Users } from './entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepositoryProvider, UsersServiceProvider } from './users.provider';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Users]), JwtModule, forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersRepositoryProvider, UsersServiceProvider],
  exports: [UsersRepositoryProvider],
})
export class UsersModule {}
