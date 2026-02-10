import { Inject, Injectable } from '@nestjs/common';
import { RoleInheritance } from '@modules/rbac/domain/entities/role-inheritance.entity';
import { RoleInheritanceRepository } from '@modules/rbac/domain/repositories/role-inheritance.repository';

@Injectable()
export class ListRoleInheritanceUseCase {
  constructor(
    @Inject('RoleInheritanceRepository')
    private readonly roleInheritanceRepository: RoleInheritanceRepository,
  ) {}

  async execute(
    roleId: string,
  ): Promise<{ parents: RoleInheritance[]; children: RoleInheritance[] }> {
    const parents = await this.roleInheritanceRepository.findByChildId(roleId);
    const children =
      await this.roleInheritanceRepository.findByParentId(roleId);
    return { parents, children };
  }
}
