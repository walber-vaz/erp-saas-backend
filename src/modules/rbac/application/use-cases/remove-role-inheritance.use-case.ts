import { Inject, Injectable } from '@nestjs/common';
import { RoleInheritanceRepository } from '@modules/rbac/domain/repositories/role-inheritance.repository';

@Injectable()
export class RemoveRoleInheritanceUseCase {
  constructor(
    @Inject(RoleInheritanceRepository)
    private readonly roleInheritanceRepository: RoleInheritanceRepository,
  ) {}

  async execute(parentRoleId: string, childRoleId: string): Promise<void> {
    await this.roleInheritanceRepository.delete(parentRoleId, childRoleId);
  }
}
