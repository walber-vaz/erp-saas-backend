import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { RoleErrorMessages } from '@modules/rbac/domain/constants/error-messages';

@Injectable()
export class FindRoleUseCase {
  constructor(
    @Inject(RoleRepository)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new DomainException(RoleErrorMessages.NOT_FOUND);
    }
    return role;
  }
}
