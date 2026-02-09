import { Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import {
  AuthErrorMessages,
  UserErrorMessages,
} from '@modules/auth/domain/constants/error-messages';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { HashService } from '../services/hash.service';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainException(UserErrorMessages.NOT_FOUND);
    }

    const isValid = await this.hashService.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      throw new DomainException(AuthErrorMessages.CURRENT_PASSWORD_INVALID);
    }

    const newHash = await this.hashService.hash(newPassword);
    user.updatePassword(newHash);

    await this.userRepository.update(user);
    await this.refreshTokenRepository.revokeAllByUserId(userId);
  }
}
