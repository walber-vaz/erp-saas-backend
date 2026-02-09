import { RefreshToken } from '../entities/refresh-token.entity';

export abstract class RefreshTokenRepository {
  abstract findById(id: string): Promise<RefreshToken | null>;
  abstract findByToken(token: string): Promise<RefreshToken | null>;
  abstract findByFamily(family: string): Promise<RefreshToken[]>;
  abstract findByUserId(userId: string): Promise<RefreshToken[]>;
  abstract create(refreshToken: RefreshToken): Promise<RefreshToken>;
  abstract update(refreshToken: RefreshToken): Promise<RefreshToken>;
  abstract revokeAllByFamily(family: string): Promise<void>;
  abstract revokeAllByUserId(userId: string): Promise<void>;
  abstract deleteExpired(): Promise<void>;
}
