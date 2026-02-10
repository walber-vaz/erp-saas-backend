import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { CreateModuleDto } from '../dtos/create-module.dto';
import { ModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';

@Injectable()
export class CreateModuleUseCase {
  constructor(
    @Inject(ModuleRepository)
    private readonly moduleRepository: ModuleRepository,
  ) {}

  async execute(dto: CreateModuleDto): Promise<Module> {
    const existingModule = await this.moduleRepository.findByCode(
      dto.code.toUpperCase(),
    );
    if (existingModule) {
      throw new DomainException(ModuleErrorMessages.CODE_ALREADY_IN_USE);
    }

    const module = Module.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      icon: dto.icon,
      isActive: dto.isActive,
      sortOrder: dto.sortOrder,
    });

    return this.moduleRepository.create(module);
  }
}
