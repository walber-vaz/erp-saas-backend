import { Inject, Injectable } from '@nestjs/common';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';

@Injectable()
export class ListRolesUseCase {
  constructor(
    @Inject(RoleRepository)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(organizationId: string | null): Promise<Role[]> {
    return this.roleRepository.findByOrganization(organizationId);
  }
}
