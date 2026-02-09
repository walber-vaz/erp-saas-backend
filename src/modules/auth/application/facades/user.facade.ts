import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { FindUserUseCase } from '../use-cases/find-user.use-case';
import { ListUsersUseCase } from '../use-cases/list-users.use-case';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case';
import { ChangePasswordUseCase } from '../use-cases/change-password.use-case';
import { DeactivateUserUseCase } from '../use-cases/deactivate-user.use-case';
import { User } from '@modules/auth/domain/entities/user.entity';
import {
  FindByOrganizationParams,
  FindByOrganizationResult,
} from '@modules/auth/domain/repositories/user.repository';

@Injectable()
export class UserFacade {
  constructor(
    private readonly findUserUC: FindUserUseCase,
    private readonly listUsersUC: ListUsersUseCase,
    private readonly updateUserUC: UpdateUserUseCase,
    private readonly changePasswordUC: ChangePasswordUseCase,
    private readonly deactivateUserUC: DeactivateUserUseCase,
  ) {}

  async findById(id: string): Promise<User> {
    return await this.findUserUC.execute(id);
  }

  async list(
    organizationId: string,
    params?: FindByOrganizationParams,
  ): Promise<FindByOrganizationResult> {
    return await this.listUsersUC.execute(organizationId, params);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    return await this.updateUserUC.execute(id, dto);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await this.changePasswordUC.execute(userId, currentPassword, newPassword);
  }

  async deactivate(id: string): Promise<void> {
    await this.deactivateUserUC.execute(id);
  }
}
