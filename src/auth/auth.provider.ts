import { Provider } from '@nestjs/common';
import { IAuthService } from './interfaces/iauth-service.interface';
import { AuthService } from 'src/auth/implements/auth.service';

export const AuthServiceProvider: Provider = {
  provide: IAuthService,
  useClass: AuthService,
};
