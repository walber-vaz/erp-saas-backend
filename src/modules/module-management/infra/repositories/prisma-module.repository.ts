import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { Module as PrismaModule } from '@generated/prisma/client';

@Injectable()
export class PrismaModuleRepository extends ModuleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Module | null> {
    const record = await this.prisma.module.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  private toDomain(record: PrismaModule): Module {
    return Module.create({
      id: record.id,
      code: record.code,
      name: record.name,
      description: record.description,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
