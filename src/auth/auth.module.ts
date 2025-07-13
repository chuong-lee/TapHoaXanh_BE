import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthRepositoryProvider, AuthServiceProvider } from './auth.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Token]), forwardRef(() => UsersModule), JwtModule],
  controllers: [AuthController],
  providers: [AuthServiceProvider, AuthRepositoryProvider],
  exports: [AuthServiceProvider],
})
export class AuthModule {}
