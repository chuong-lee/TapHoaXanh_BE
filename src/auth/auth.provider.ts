import { Provider } from '@nestjs/common';
import { IAuthService } from './interfaces/iauth-service.interface';
import { AuthService } from './implements/auth.service';
import { AuthRepository } from './implements/auth.repository';
import { IAuthRepository } from './interfaces/iauth-repository.interface';

export const AuthServiceProvider: Provider = {
  provide: IAuthService,
  useClass: AuthService,
};
export const AuthRepositoryProvider: Provider = {
  provide: IAuthRepository,
  useClass: AuthRepository,
};
