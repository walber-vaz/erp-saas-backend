import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';

@Injectable()
export class RevokeAllTokensUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUserId(userId);
  }
}
