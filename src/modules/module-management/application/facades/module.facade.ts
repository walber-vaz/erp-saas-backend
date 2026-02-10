import { Injectable } from '@nestjs/common';
import { CreateModuleDto } from '../dtos/create-module.dto';
import { UpdateModuleDto } from '../dtos/update-module.dto';
import { CreateModuleUseCase } from '../use-cases/create-module.use-case';
import { UpdateModuleUseCase } from '../use-cases/update-module.use-case';
import { FindModuleUseCase } from '../use-cases/find-module.use-case';
import { ListModulesUseCase } from '../use-cases/list-modules.use-case';
import { ActivateModuleUseCase } from '../use-cases/activate-module.use-case';
import { DeactivateModuleUseCase } from '../use-cases/deactivate-module.use-case';
import { Module } from '../../domain/entities/module.entity';

@Injectable()
export class ModuleFacade {
  constructor(
    private readonly createModuleUC: CreateModuleUseCase,
    private readonly updateModuleUC: UpdateModuleUseCase,
    private readonly findModuleUC: FindModuleUseCase,
    private readonly listModulesUC: ListModulesUseCase,
    private readonly activateModuleUC: ActivateModuleUseCase,
    private readonly deactivateModuleUC: DeactivateModuleUseCase,
  ) {}

  async create(dto: CreateModuleDto): Promise<Module> {
    return await this.createModuleUC.execute(dto);
  }

  async update(id: string, dto: UpdateModuleDto): Promise<Module> {
    return await this.updateModuleUC.execute(id, dto);
  }

  async findById(id: string): Promise<Module> {
    return await this.findModuleUC.execute(id);
  }

  async list(params?: { isActive?: boolean }): Promise<Module[]> {
    return await this.listModulesUC.execute(params?.isActive);
  }

  async activate(id: string): Promise<Module> {
    return await this.activateModuleUC.execute(id);
  }

  async deactivate(id: string): Promise<Module> {
    return await this.deactivateModuleUC.execute(id);
  }

  async delete(id: string): Promise<void> {
    await this.deactivateModuleUC.execute(id);
  }
}
