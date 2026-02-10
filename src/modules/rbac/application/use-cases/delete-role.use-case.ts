import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { RoleErrorMessages } from '@modules/rbac/domain/constants/error-messages';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject(RoleRepository)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new DomainException(RoleErrorMessages.NOT_FOUND);
    }

    if (role.isSystem) {
      throw new DomainException(RoleErrorMessages.IS_SYSTEM_IMMUTABLE);
    }

    await this.roleRepository.delete(id);
  }
}
