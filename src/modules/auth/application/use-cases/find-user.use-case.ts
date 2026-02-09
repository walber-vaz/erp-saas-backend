import { Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { UserErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';

@Injectable()
export class FindUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new DomainException(UserErrorMessages.NOT_FOUND);
    }

    return user;
  }
}
