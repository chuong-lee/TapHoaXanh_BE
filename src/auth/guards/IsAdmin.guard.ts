import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { IAuthService } from '../interfaces/iauth-service.interface';
import { TUserRole } from 'src/types/common.enum';

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(private readonly authService: IAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request['user'];
    if (user.role !== TUserRole.ADMIN) {
      throw new UnauthorizedException('Bạn không có quyền truy cập');
    }
    return true;
  }
}