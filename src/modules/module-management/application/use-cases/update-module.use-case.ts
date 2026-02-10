import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { UpdateModuleDto } from '../dtos/update-module.dto';
import { ModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';

@Injectable()
export class UpdateModuleUseCase {
  constructor(
    @Inject(ModuleRepository)
    private readonly moduleRepository: ModuleRepository,
  ) {}

  async execute(id: string, dto: UpdateModuleDto): Promise<Module> {
    const module = await this.moduleRepository.findById(id);
    if (!module) {
      throw new DomainException(ModuleErrorMessages.NOT_FOUND);
    }

    // Currently, code is not updatable via DTO as per current Module entity design.
    // If it becomes updatable, uniqueness check against other modules would be needed.
    const updatedModule = module.update({
      name: dto.name,
      description: dto.description,
      icon: dto.icon,
      sortOrder: dto.sortOrder,
    });

    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        updatedModule.activate();
      } else {
        updatedModule.deactivate();
      }
    }

    return this.moduleRepository.update(updatedModule);
  }
}
