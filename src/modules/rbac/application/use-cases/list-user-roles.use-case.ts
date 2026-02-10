import { Inject, Injectable } from '@nestjs/common';
import { UserRole } from '@modules/rbac/domain/entities/user-role.entity';
import { UserRoleRepository } from '@modules/rbac/domain/repositories/user-role.repository';

@Injectable()
export class ListUserRolesUseCase {
  constructor(
    @Inject(UserRoleRepository)
    private readonly userRoleRepository: UserRoleRepository,
  ) {}

  async execute(userId: string): Promise<UserRole[]> {
    const userRoles = await this.userRoleRepository.findByUserId(userId);
    return userRoles.filter((userRole) => !userRole.isExpired());
  }
}
