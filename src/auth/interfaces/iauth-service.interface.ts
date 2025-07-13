export abstract class IAuthService {
  abstract register(dto: any): Promise<any>;
  abstract login(email: string, password: string): Promise<any>;
  abstract forgotPassword(email: string): Promise<any>;
  abstract verifyToken(token: string, userId: number): Promise<boolean>;
  abstract refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }>;
  //   abstract logout(): Promise<{ message: string }>;
}
