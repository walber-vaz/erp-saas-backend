import { Inject, Injectable } from '@nestjs/common';
import { UserRoleRepository } from '@modules/rbac/domain/repositories/user-role.repository';

@Injectable()
export class RemoveRoleFromUserUseCase {
  constructor(
    @Inject(UserRoleRepository)
    private readonly userRoleRepository: UserRoleRepository,
  ) {}

  async execute(userId: string, roleId: string): Promise<void> {
    await this.userRoleRepository.delete(userId, roleId);
  }
}
