import { Inject, Injectable } from '@nestjs/common';
import { Permission } from '../../../domain/entities/permission.entity';
import { PermissionRepository } from '../../../domain/repositories/permission.repository';

@Injectable()
export class ListPermissionsUseCase {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(moduleId?: string): Promise<Permission[]> {
    if (moduleId) {
      return this.permissionRepository.findByModule(moduleId);
    }
    return this.permissionRepository.findAll();
  }
}
