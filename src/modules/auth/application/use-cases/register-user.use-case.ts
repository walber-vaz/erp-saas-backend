import { Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { UserErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { HashService } from '../services/hash.service';
import { RegisterUserDto } from '../dtos/register-user.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(dto: RegisterUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(
      dto.organizationId,
      dto.email,
    );
    if (existingUser) {
      throw new DomainException(UserErrorMessages.EMAIL_TAKEN);
    }

    const passwordHash = await this.hashService.hash(dto.password);

    const user = User.create({
      organizationId: dto.organizationId,
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    return this.userRepository.create(user);
  }
}
