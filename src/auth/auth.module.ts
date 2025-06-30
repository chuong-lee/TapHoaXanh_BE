import { Module } from '@nestjs/common';
import { AuthService } from './implements/auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthServiceProvider } from './auth.provider';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthServiceProvider],
})
export class AuthModule {}
