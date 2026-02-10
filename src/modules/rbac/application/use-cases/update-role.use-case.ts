import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { UpdateRoleDto } from '@modules/rbac/application/dtos/update-role.dto';
import { RoleErrorMessages } from '@modules/rbac/domain/constants/error-messages';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new DomainException(RoleErrorMessages.NOT_FOUND);
    }

    if (role.isSystem) {
      throw new DomainException(RoleErrorMessages.IS_SYSTEM_IMMUTABLE);
    }

    role.update({
      name: dto.name,
      description: dto.description,
    });

    return this.roleRepository.update(role);
  }
}
