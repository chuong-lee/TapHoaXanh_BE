import { Token } from '../entities/token.entity';

export abstract class IAuthRepository {
  abstract createToken(tokenData: Token): Promise<void>;
  abstract checkTokenByUserId(userId: number, token: string): Promise<boolean>;
  abstract checkRefreshToken(token: string, userId: number): Promise<boolean>;
  abstract deleteTokenByUserId(userId: number): Promise<void>;
}
