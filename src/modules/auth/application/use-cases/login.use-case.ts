import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { AuthErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { RefreshToken } from '@modules/auth/domain/entities/refresh-token.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { HashService } from '../services/hash.service';
import { TokenService } from '../services/token.service';
import { LoginDto } from '../dtos/login.dto';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    organizationId: string;
    name: string;
    email: string;
  };
}

@Injectable()
export class LoginUseCase {
  private readonly REFRESH_TOKEN_DAYS = 7;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(
      dto.organizationId,
      dto.email,
    );
    if (!user) {
      throw new DomainException(AuthErrorMessages.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new DomainException(AuthErrorMessages.USER_INACTIVE);
    }

    const passwordValid = await this.hashService.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordValid) {
      throw new DomainException(AuthErrorMessages.INVALID_CREDENTIALS);
    }

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
    });

    const refreshTokenValue = this.tokenService.generateRefreshToken();
    const family = uuidv7();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_DAYS);

    const refreshToken = RefreshToken.create({
      userId: user.id,
      token: refreshTokenValue,
      family,
      expiresAt,
    });

    await this.refreshTokenRepository.create(refreshToken);

    user.recordLogin();
    await this.userRepository.update(user);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user.id,
        organizationId: user.organizationId,
        name: user.name,
        email: user.email,
      },
    };
  }
}
