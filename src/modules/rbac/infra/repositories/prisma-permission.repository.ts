import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { Permission } from '@modules/rbac/domain/entities/permission.entity';
import { PermissionRepository } from '@modules/rbac/domain/repositories/permission.repository';
import { Permission as PrismaPermission } from '@generated/prisma/client';

@Injectable()
export class PrismaPermissionRepository extends PermissionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Permission | null> {
    const record = await this.prisma.permission.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByCode(code: string): Promise<Permission | null> {
    const record = await this.prisma.permission.findUnique({
      where: { code },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByModule(moduleId: string): Promise<Permission[]> {
    const records = await this.prisma.permission.findMany({
      where: { moduleId },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findAll(): Promise<Permission[]> {
    const records = await this.prisma.permission.findMany();
    return records.map((record) => this.toDomain(record));
  }

  async create(permission: Permission): Promise<Permission> {
    const record = await this.prisma.permission.create({
      data: this.toPrisma(permission),
    });
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.permission.delete({ where: { id } });
  }

  private toDomain(record: PrismaPermission): Permission {
    return Permission.create({
      id: record.id,
      moduleId: record.moduleId,
      code: record.code,
      resource: record.resource,
      action: record.action,
      description: record.description,
      createdAt: record.createdAt,
    });
  }

  private toPrisma(permission: Permission) {
    return {
      id: permission.id,
      moduleId: permission.moduleId,
      code: permission.code,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
    };
  }
}
