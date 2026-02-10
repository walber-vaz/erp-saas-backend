import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { ModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';

@Injectable()
export class ActivateModuleUseCase {
  constructor(
    @Inject(ModuleRepository)
    private readonly moduleRepository: ModuleRepository,
  ) {}

  async execute(id: string): Promise<Module> {
    const module = await this.moduleRepository.findById(id);
    if (!module) {
      throw new DomainException(ModuleErrorMessages.NOT_FOUND);
    }

    module.activate();

    return this.moduleRepository.update(module);
  }
}
