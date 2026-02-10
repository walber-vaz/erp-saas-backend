import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { CreateRoleDto } from '@modules/rbac/application/dtos/create-role.dto';
import { RoleErrorMessages } from '@modules/rbac/domain/constants/error-messages';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(dto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findByCode(
      dto.organizationId ?? null,
      dto.code,
    );
    if (existingRole) {
      throw new DomainException(RoleErrorMessages.CODE_ALREADY_IN_USE);
    }

    const role = Role.create({
      organizationId: dto.organizationId ?? null,
      name: dto.name,
      code: dto.code,
      description: dto.description,
    });

    return this.roleRepository.create(role);
  }
}
