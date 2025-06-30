

export abstract class IAuthService {
  abstract register(dto: any): Promise<any>;
  abstract login(email: string, password: string): Promise<any>;
  abstract forgotPassword(email: string): Promise<any>;
//   abstract logout(): Promise<{ message: string }>;
  
}