import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { RoleInheritance } from '@modules/rbac/domain/entities/role-inheritance.entity';
import { RoleInheritanceRepository } from '@modules/rbac/domain/repositories/role-inheritance.repository';
import { CreateRoleInheritanceDto } from '@modules/rbac/application/dtos/create-role-inheritance.dto';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { RoleInheritanceErrorMessages } from '@modules/rbac/domain/constants/error-messages';

@Injectable()
export class CreateRoleInheritanceUseCase {
  constructor(
    @Inject('RoleInheritanceRepository')
    private readonly roleInheritanceRepository: RoleInheritanceRepository,
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(dto: CreateRoleInheritanceDto): Promise<RoleInheritance> {
    const parentRole = await this.roleRepository.findById(dto.parentRoleId);
    if (!parentRole) {
      throw new DomainException(
        RoleInheritanceErrorMessages.PARENT_ROLE_NOT_FOUND,
      );
    }

    const childRole = await this.roleRepository.findById(dto.childRoleId);
    if (!childRole) {
      throw new DomainException(
        RoleInheritanceErrorMessages.CHILD_ROLE_NOT_FOUND,
      );
    }

    if (dto.parentRoleId === dto.childRoleId) {
      throw new DomainException(
        RoleInheritanceErrorMessages.CANNOT_INHERIT_SELF,
      );
    }

    // Cycle detection: check if adding this edge (child → parent) would create a cycle.
    // We traverse ancestors of parentRoleId; if we reach childRoleId, it's a cycle.
    const visited = new Set<string>();
    const queue = [dto.parentRoleId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (currentId === dto.childRoleId) {
        throw new DomainException(RoleInheritanceErrorMessages.CYCLE_DETECTED);
      }
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const parents =
        await this.roleInheritanceRepository.findByChildId(currentId);
      for (const parent of parents) {
        if (!visited.has(parent.parentRoleId)) {
          queue.push(parent.parentRoleId);
        }
      }
    }

    const roleInheritance = RoleInheritance.create({
      parentRoleId: dto.parentRoleId,
      childRoleId: dto.childRoleId,
    });

    return this.roleInheritanceRepository.create(roleInheritance);
  }
}
