import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { CreatePermissionUseCase } from '../use-cases/create-permission.use-case';
import { DeletePermissionUseCase } from '../use-cases/delete-permission.use-case';
import { FindPermissionUseCase } from '../use-cases/find-permission.use-case';
import { ListPermissionsUseCase } from '../use-cases/list-permissions.use-case';

@Injectable()
export class PermissionFacade {
  constructor(
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly findPermissionUseCase: FindPermissionUseCase,
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
    private readonly deletePermissionUseCase: DeletePermissionUseCase,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    return this.createPermissionUseCase.execute(createPermissionDto);
  }

  async findById(id: string) {
    return this.findPermissionUseCase.execute({ id });
  }

  async list(filters: { moduleId?: string }) {
    return this.listPermissionsUseCase.execute(filters);
  }

  async delete(id: string) {
    await this.deletePermissionUseCase.execute({ id });
  }
}
