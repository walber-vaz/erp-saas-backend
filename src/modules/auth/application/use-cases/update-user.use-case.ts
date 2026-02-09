import { Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { UserErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new DomainException(UserErrorMessages.NOT_FOUND);
    }

    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.userRepository.findByEmail(
        user.organizationId,
        dto.email,
      );
      if (existingEmail) {
        throw new DomainException(UserErrorMessages.EMAIL_TAKEN);
      }
    }

    user.update(dto);

    return this.userRepository.update(user);
  }
}
