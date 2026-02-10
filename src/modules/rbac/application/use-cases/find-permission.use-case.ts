import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { Permission } from '@modules/rbac/domain/entities/permission.entity';
import { PermissionRepository } from '@modules/rbac/domain/repositories/permission.repository';
import { PermissionErrorMessages } from '@modules/rbac/domain/constants/error-messages';

@Injectable()
export class FindPermissionUseCase {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new DomainException(PermissionErrorMessages.NOT_FOUND);
    }
    return permission;
  }
}
