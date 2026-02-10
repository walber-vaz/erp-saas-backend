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

    // Basic validation: A role cannot inherit from itself.
    // More advanced cycle detection would be needed here, potentially involving graph traversal.
    if (dto.parentRoleId === dto.childRoleId) {
      throw new DomainException(
        RoleInheritanceErrorMessages.CANNOT_INHERIT_SELF,
      );
    }

    const roleInheritance = RoleInheritance.create({
      parentRoleId: dto.parentRoleId,
      childRoleId: dto.childRoleId,
    });

    return this.roleInheritanceRepository.create(roleInheritance);
  }
}
