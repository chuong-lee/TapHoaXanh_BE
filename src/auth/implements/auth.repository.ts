import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
import { IAuthRepository } from '../interfaces/iauth-repository.interface';
import { InternalServerErrorException } from '@nestjs/common';

export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async createToken(tokenData: Token): Promise<void> {
    try {
      const existingToken = await this.tokenRepository.findOne({ where: { user: { id: tokenData.user.id } } });
      if (existingToken) {
        await this.tokenRepository.update(existingToken.id, { ...existingToken, ...tokenData, updatedAt: new Date() });
        return;
      }
      await this.tokenRepository.save(tokenData);
      return;
    } catch (error) {
      throw new InternalServerErrorException('Error creating token', error.message);
    }
  }

  async checkTokenByUserId(userId: number, token: string): Promise<boolean> {
    const foundToken = await this.tokenRepository.findOne({ where: { access_token: token, user: { id: userId } } });
    return !!foundToken;
  }
  async checkRefreshToken(refreshToken: string, userId: number): Promise<boolean> {
    const foundToken = await this.tokenRepository.findOne({
      where: { refresh_token: refreshToken, user: { id: userId } },
    });
    return !!foundToken;
  }

  async deleteTokenByUserId(userId: number): Promise<void> {
    await this.tokenRepository.delete({ user: { id: userId } });
  }
}
