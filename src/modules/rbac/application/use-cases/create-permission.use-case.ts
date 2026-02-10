import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { Permission } from '../../../domain/entities/permission.entity';
import { PermissionRepository } from '../../../domain/repositories/permission.repository';
import { CreatePermissionDto } from '../../dtos/create-permission.dto';
import { ModuleRepository } from '../../../../module-management/domain/repositories/module.repository';
import { PermissionErrorMessages } from '../../../domain/constants/error-messages';

@Injectable()
export class CreatePermissionUseCase {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
    @Inject('ModuleRepository')
    private readonly moduleRepository: ModuleRepository,
  ) {}

  async execute(dto: CreatePermissionDto): Promise<Permission> {
    const module = await this.moduleRepository.findById(dto.moduleId);
    if (!module) {
      throw new DomainException(PermissionErrorMessages.MODULE_NOT_FOUND);
    }

    const code = Permission.generateCode(module.code, dto.resource, dto.action);

    const existingPermission = await this.permissionRepository.findByCode(code);
    if (existingPermission) {
      throw new DomainException(PermissionErrorMessages.CODE_ALREADY_IN_USE);
    }

    const permission = Permission.create({
      moduleId: dto.moduleId,
      resource: dto.resource,
      action: dto.action,
      description: dto.description,
      code,
    });

    return this.permissionRepository.create(permission);
  }
}
