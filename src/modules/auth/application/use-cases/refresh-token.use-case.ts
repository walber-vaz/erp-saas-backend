import { Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { AuthErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { RefreshToken } from '@modules/auth/domain/entities/refresh-token.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { TokenService } from '../services/token.service';

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  private readonly REFRESH_TOKEN_DAYS = 7;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(token: string): Promise<RefreshTokenResult> {
    const existingToken = await this.refreshTokenRepository.findByToken(token);
    if (!existingToken) {
      throw new DomainException(AuthErrorMessages.REFRESH_TOKEN_NOT_FOUND);
    }

    if (existingToken.isRevoked) {
      await this.refreshTokenRepository.revokeAllByFamily(existingToken.family);
      throw new DomainException(AuthErrorMessages.REFRESH_TOKEN_REVOKED);
    }

    if (existingToken.isExpired()) {
      throw new DomainException(AuthErrorMessages.REFRESH_TOKEN_EXPIRED);
    }

    existingToken.revoke();
    await this.refreshTokenRepository.update(existingToken);

    const user = await this.userRepository.findById(existingToken.userId);
    if (!user || !user.isActive) {
      throw new DomainException(AuthErrorMessages.USER_INACTIVE);
    }

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
    });

    const newRefreshTokenValue = this.tokenService.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_DAYS);

    const newRefreshToken = RefreshToken.create({
      userId: user.id,
      token: newRefreshTokenValue,
      family: existingToken.family,
      expiresAt,
    });

    await this.refreshTokenRepository.create(newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshTokenValue,
    };
  }
}
