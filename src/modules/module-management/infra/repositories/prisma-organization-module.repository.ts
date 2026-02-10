import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { OrganizationModule } from '@modules/module-management/domain/entities/organization-module.entity';
import { OrganizationModuleRepository } from '@modules/module-management/domain/repositories/organization-module.repository';
import { OrganizationModule as PrismaOrganizationModule } from '@generated/prisma/client';

@Injectable()
export class PrismaOrganizationModuleRepository extends OrganizationModuleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<OrganizationModule | null> {
    const record = await this.prisma.organizationModule.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByOrganizationAndModule(
    organizationId: string,
    moduleId: string,
  ): Promise<OrganizationModule | null> {
    const record = await this.prisma.organizationModule.findUnique({
      where: { organizationId_moduleId: { organizationId, moduleId } },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByOrganization(
    organizationId: string,
    params?: { isActive?: boolean },
  ): Promise<OrganizationModule[]> {
    const records = await this.prisma.organizationModule.findMany({
      where: { organizationId, isActive: params?.isActive },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findByModule(moduleId: string): Promise<OrganizationModule[]> {
    const records = await this.prisma.organizationModule.findMany({
      where: { moduleId },
    });
    return records.map((record) => this.toDomain(record));
  }

  async create(orgModule: OrganizationModule): Promise<OrganizationModule> {
    const record = await this.prisma.organizationModule.create({
      data: this.toPrisma(orgModule),
    });
    return this.toDomain(record);
  }

  async update(orgModule: OrganizationModule): Promise<OrganizationModule> {
    const record = await this.prisma.organizationModule.update({
      where: { id: orgModule.id },
      data: this.toPrisma(orgModule),
    });
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organizationModule.delete({ where: { id } });
  }

  private toDomain(record: PrismaOrganizationModule): OrganizationModule {
    return OrganizationModule.create({
      id: record.id,
      organizationId: record.organizationId,
      moduleId: record.moduleId,
      isActive: record.isActive,
      activatedAt: record.activatedAt,
      deactivatedAt: record.deactivatedAt,
    });
  }

  private toPrisma(orgModule: OrganizationModule) {
    return {
      id: orgModule.id,
      organizationId: orgModule.organizationId,
      moduleId: orgModule.moduleId,
      isActive: orgModule.isActive,
      activatedAt: orgModule.activatedAt ?? undefined,
      deactivatedAt: orgModule.deactivatedAt ?? undefined,
    };
  }
}
