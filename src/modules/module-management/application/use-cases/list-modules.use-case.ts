import { Inject, Injectable } from '@nestjs/common';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';

@Injectable()
export class ListModulesUseCase {
  constructor(
    @Inject(ModuleRepository)
    private readonly moduleRepository: ModuleRepository,
  ) {}

  async execute(isActive?: boolean): Promise<Module[]> {
    return this.moduleRepository.findAll({ isActive });
  }
}
