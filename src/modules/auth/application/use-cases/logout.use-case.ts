import { Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { AuthErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(token: string): Promise<void> {
    const existingToken = await this.refreshTokenRepository.findByToken(token);
    if (!existingToken) {
      throw new DomainException(AuthErrorMessages.REFRESH_TOKEN_NOT_FOUND);
    }

    if (!existingToken.isRevoked) {
      existingToken.revoke();
      await this.refreshTokenRepository.update(existingToken);
    }
  }
}
