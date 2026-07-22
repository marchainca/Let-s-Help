import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthDataBaseService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async revokeRefreshTokensByUserId(userId: number): Promise<void> {
    try {
      await this.refreshTokenRepository.delete({ IdUser: userId });
    } catch (error) {
      console.error('Error revoking refresh tokens:', error.message || error);
      throw error;
    }
  }

  async saveRefreshToken(userId: number, token: string, expiresAt: Date): Promise<RefreshToken> {
    try {
      const refreshToken = this.refreshTokenRepository.create({
        IdUser: userId,
        Token: token,
        ExpiresAt: expiresAt,
      });
      return this.refreshTokenRepository.save(refreshToken);
    } catch (error) {
      console.error('Error saving refresh token:', error.message || error);
      throw error;
    }
  }

  async findValidRefreshToken(token: string): Promise<RefreshToken | null> {
    try {
      return this.refreshTokenRepository.findOne({
        where: {
          Token: token,
          ExpiresAt: MoreThan(new Date()),
        },
        relations: ['user', 'user.role'],
      });
    } catch (error) {
      console.error('Error finding refresh token:', error.message || error);
      throw error;
    }
  }

  async deleteRefreshToken(token: string): Promise<void> {
    try {
      await this.refreshTokenRepository.delete({ Token: token });
    } catch (error) {
      console.error('Error deleting refresh token:', error.message || error);
      throw error;
    }
  }
}
