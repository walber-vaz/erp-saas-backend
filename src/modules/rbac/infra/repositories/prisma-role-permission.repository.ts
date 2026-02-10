import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { RolePermission } from '@modules/rbac/domain/entities/role-permission.entity';
import { RolePermissionRepository } from '@modules/rbac/domain/repositories/role-permission.repository';
import {
  Prisma,
  RolePermission as PrismaRolePermission,
} from '@generated/prisma/client';

@Injectable()
export class PrismaRolePermissionRepository extends RolePermissionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByRoleId(roleId: string): Promise<RolePermission[]> {
    const records = await this.prisma.rolePermission.findMany({
      where: { roleId },
    });
    return records.map((record) => this.toDomain(record));
  }

  async create(rolePermission: RolePermission): Promise<RolePermission> {
    const record = await this.prisma.rolePermission.create({
      data: this.toPrisma(rolePermission),
    });
    return this.toDomain(record);
  }

  async delete(roleId: string, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }

  async deleteAllByRoleId(roleId: string): Promise<void> {
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
  }

  private toDomain(record: PrismaRolePermission): RolePermission {
    return RolePermission.create({
      id: record.id,
      roleId: record.roleId,
      permissionId: record.permissionId,
      conditions: record.conditions as Record<string, any> | null,
      createdAt: record.createdAt,
    });
  }

  private toPrisma(rolePermission: RolePermission) {
    return {
      id: rolePermission.id,
      roleId: rolePermission.roleId,
      permissionId: rolePermission.permissionId,
      conditions: rolePermission.conditions ?? Prisma.JsonNull,
    };
  }
}
