import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { UserRole } from '@modules/rbac/domain/entities/user-role.entity';
import { UserRoleRepository } from '@modules/rbac/domain/repositories/user-role.repository';
import { AssignUserRoleDto } from '@modules/rbac/application/dtos/assign-user-role.dto';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { UserRoleErrorMessages } from '@modules/rbac/domain/constants/error-messages';
import { UserErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { RoleErrorMessages } from '@modules/rbac/domain/constants/error-messages';

@Injectable()
export class AssignRoleToUserUseCase {
  constructor(
    @Inject('UserRoleRepository')
    private readonly userRoleRepository: UserRoleRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(dto: AssignUserRoleDto): Promise<UserRole> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new DomainException(UserErrorMessages.NOT_FOUND);
    }

    const role = await this.roleRepository.findById(dto.roleId);
    if (!role) {
      throw new DomainException(RoleErrorMessages.NOT_FOUND);
    }

    // Validate if user and role are from the same organization (or role is system-wide)
    if (
      role.organizationId !== null &&
      user.organizationId !== role.organizationId
    ) {
      throw new DomainException(UserRoleErrorMessages.ORGANIZATION_MISMATCH);
    }

    const userRole = UserRole.create({
      userId: dto.userId,
      roleId: dto.roleId,
      assignedBy: dto.assignedBy,
      expiresAt: dto.expiresAt,
    });

    return this.userRoleRepository.create(userRole);
  }
}
