import { Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { UserErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';

@Injectable()
export class DeactivateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new DomainException(UserErrorMessages.NOT_FOUND);
    }

    user.deactivate();

    await this.userRepository.update(user);
    await this.refreshTokenRepository.revokeAllByUserId(id);
  }
}
