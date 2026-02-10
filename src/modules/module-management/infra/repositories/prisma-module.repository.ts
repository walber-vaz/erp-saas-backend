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

  async findByCode(code: string): Promise<Module | null> {
    const record = await this.prisma.module.findUnique({
      where: { code: code.toUpperCase() },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(params?: { isActive?: boolean }): Promise<Module[]> {
    const records = await this.prisma.module.findMany({
      where: { isActive: params?.isActive },
    });
    return records.map((record) => this.toDomain(record));
  }

  async create(module: Module): Promise<Module> {
    const record = await this.prisma.module.create({
      data: this.toPrisma(module),
    });
    return this.toDomain(record);
  }

  async update(module: Module): Promise<Module> {
    const record = await this.prisma.module.update({
      where: { id: module.id },
      data: this.toPrisma(module),
    });
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.module.delete({ where: { id } });
  }

  private toDomain(record: PrismaModule): Module {
    return Module.create({
      id: record.id,
      code: record.code,
      name: record.name,
      description: record.description,
      icon: record.icon,
      isActive: record.isActive,
      sortOrder: record.sortOrder,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toPrisma(module: Module) {
    return {
      id: module.id,
      code: module.code,
      name: module.name,
      description: module.description,
      icon: module.icon,
      isActive: module.isActive,
      sortOrder: module.sortOrder,
    };
  }
}