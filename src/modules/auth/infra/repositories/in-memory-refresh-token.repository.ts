import { Injectable } from '@nestjs/common';
import { RefreshToken } from '@modules/auth/domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';

@Injectable()
export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private refreshTokens: RefreshToken[] = [];

  async findById(id: string): Promise<RefreshToken | null> {
    return this.refreshTokens.find((token) => token.id === id) || null;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokens.find((rt) => rt.token === token) || null;
  }

  async findByFamily(family: string): Promise<RefreshToken[]> {
    return this.refreshTokens.filter((token) => token.family === family);
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokens.filter((token) => token.userId === userId);
  }

  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    this.refreshTokens.push(refreshToken);
    return refreshToken;
  }

  async update(refreshToken: RefreshToken): Promise<RefreshToken> {
    const index = this.refreshTokens.findIndex(
      (rt) => rt.id === refreshToken.id,
    );
    if (index !== -1) {
      this.refreshTokens[index] = refreshToken;
    }
    return refreshToken;
  }

  async revokeAllByFamily(family: string): Promise<void> {
    this.refreshTokens = this.refreshTokens.map((token) =>
      token.family === family ? { ...token, isRevoked: true } : token,
    ) as RefreshToken[];
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    this.refreshTokens = this.refreshTokens.map((token) =>
      token.userId === userId ? { ...token, isRevoked: true } : token,
    ) as RefreshToken[];
  }

  async deleteExpired(): Promise<void> {
    this.refreshTokens = this.refreshTokens.filter(
      (token) => !token.isExpired(),
    );
  }

  clear(): void {
    this.refreshTokens = [];
  }
}
