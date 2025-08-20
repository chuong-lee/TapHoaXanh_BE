import { Injectable, UnauthorizedException, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterAuthDto } from 'src/auth/dto/register.dto';
import { IUsersRepository } from 'src/users/interfaces/iusers-repository.interface';
import * as nodemailer from 'nodemailer';
import { IAuthService } from 'src/auth/interfaces/iauth-service.interface';
import { JwtService } from '@nestjs/jwt';
import { IAuthRepository } from '../interfaces/iauth-repository.interface';
import { Token } from '../entities/token.entity';
import { Users } from 'src/users/entities/users.entity';
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(IUsersRepository) private readonly _userRepository: IUsersRepository,
    @Inject(IAuthRepository) private readonly _authRepository: IAuthRepository,
    private readonly _jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    const existUser = await this._userRepository.findByEmail(registerDto.email);
    if (existUser) throw new NotFoundException('Email đã tồn tại');
    if (registerDto.password !== registerDto.confirmPassword) throw new BadRequestException('Mật khẩu không khớp.');
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this._userRepository.createUser({
      ...registerDto,
      password: hashedPassword,
    });
    const { access_token, refresh_token } = await this.generateToken(user); //gọi generateToken để tạo access_token và refresh_token cho người dùng

    await this._authRepository.createToken(new Token(access_token, refresh_token, user)); //lưu token vào cơ sở dữ liệu
    return { access_token, refresh_token };
  }

  async login(email: string, password: string) {
    const user = await this._userRepository.findByEmail(email); //tìm người dùng theo email
    if (!user) throw new UnauthorizedException('Sai email hoặc mật khẩu'); //nếu không thể tìm thấy người dùng thì ném lỗi
    const isMatch = await bcrypt.compare(password, user.password); //so sánh mật khẩu đã nhập với mật khẩu đã mã hóa trong cơ sở dữ liệu
    if (!isMatch) throw new UnauthorizedException('Sai email hoặc mật khẩu'); //nếu mật khẩu không khớp thì ném lỗi
    // const { password: _, ...userWithoutPassword } = user;
    const { access_token, refresh_token } = await this.generateToken(user); //gọi generateToken để tạo access_token và refresh_token cho người dùng

    await this._authRepository.createToken(new Token(access_token, refresh_token, user)); //lưu token vào cơ sở dữ liệu
    return { access_token, refresh_token };
  }

  async generateToken(user: Users): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { sub: user.id, role: user.role }; //tạo payload chứa thông tin người dùng
    const refresh_token = await this._jwtService.signAsync(payload, {
      secret: process.env.REFRESH_JWT_SECRET,
      expiresIn: '7d',
    }); //tạo refresh_token
    const token = await this._jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });
    return { access_token: token, refresh_token: refresh_token };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const payload = await this._jwtService.verifyAsync(refreshToken, {
      secret: process.env.REFRESH_JWT_SECRET,
    }); //xác thực refresh_token

    const refreshTokenExists = await this._authRepository.checkRefreshToken(refreshToken, payload.sub); //kiểm tra xem refresh_token có tồn tại trong cơ sở dữ liệu hay không
    if (!refreshTokenExists) throw new UnauthorizedException('Refresh token không hợp lệ');
    const user = await this._userRepository.findById(payload.sub); //lấy thông tin người dùng từ cơ sở dữ liệu theo id trong payload
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    const { access_token, refresh_token } = await this.generateToken(user); //tạo access_token và refresh_token mới
    await this._authRepository.createToken(new Token(access_token, refresh_token, user)); //lưu token mới vào cơ sở dữ liệu
    //create at delete old token
    return { access_token, refresh_token };
  }

  async verifyToken(token: string, userId: number): Promise<boolean> {
    //TODO: Check if token exists in database with userId
    return await this._authRepository.checkTokenByUserId(userId, token);
  }
  async logout(userId: number): Promise<{ message: string }> {
    await this._authRepository.deleteTokenByUserId(userId);
    return { message: 'Đăng xuất thành công.' };
  }

  async forgotPassword(email: string) {
    const user = await this._userRepository.findByEmail(email);
    if (!user) throw new NotFoundException('Email không tồn tại!');
    const newPass = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this._userRepository.updatePassword(email, hashedPassword);

    // Gửi email mật khẩu mới
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'phongndps37996@gmail.com',
        pass: 'idff zvtr tggn ebcy',
      },
    });

    await transporter.sendMail({
      from: '"TapHoaXanh" <phongndps37996@gmail.com>',
      to: email,
      subject: 'Đặt lại mất khẩu tài khoản tạp hóa xanh',
      text: `Mật khẩu mới của bạn là: ${newPass}`,
    });

    return { message: 'Tạp hóa xanh đã gửi mật khẩu mới qua mail của bạn.' };
  }
}
