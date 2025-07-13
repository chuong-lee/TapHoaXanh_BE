import { Controller, Post, Body, Get, Inject } from '@nestjs/common';
import { IAuthService } from './interfaces/iauth-service.interface';
import { RegisterAuthDto } from './dto/register.dto';
import { LoginAuthDto } from './dto/login.dto';
import { ForgotPasswordAuthDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject(IAuthService) private readonly authService: IAuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterAuthDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginAuthDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordAuthDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('logout')
  logout() {
    return { message: 'Đăng xuất thành công.' };
  }
}
