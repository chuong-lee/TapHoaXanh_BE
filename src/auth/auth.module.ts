import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthRepositoryProvider, AuthServiceProvider } from './auth.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './implements/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Token]), forwardRef(() => UsersModule), JwtModule],
  controllers: [AuthController],
  providers: [AuthServiceProvider, AuthRepositoryProvider, AuthService],
  exports: [AuthServiceProvider, AuthService, JwtModule],
})
export class AuthModule {}
