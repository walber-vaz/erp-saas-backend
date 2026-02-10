import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { RoleInheritance } from '@modules/rbac/domain/entities/role-inheritance.entity';
import { RoleInheritanceRepository } from '@modules/rbac/domain/repositories/role-inheritance.repository';
import { RoleInheritance as PrismaRoleInheritance } from '@generated/prisma/client';

@Injectable()
export class PrismaRoleInheritanceRepository extends RoleInheritanceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByParentId(parentRoleId: string): Promise<RoleInheritance[]> {
    const records = await this.prisma.roleInheritance.findMany({
      where: { parentRoleId },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findByChildId(childRoleId: string): Promise<RoleInheritance[]> {
    const records = await this.prisma.roleInheritance.findMany({
      where: { childRoleId },
    });
    return records.map((record) => this.toDomain(record));
  }

  async create(roleInheritance: RoleInheritance): Promise<RoleInheritance> {
    const record = await this.prisma.roleInheritance.create({
      data: this.toPrisma(roleInheritance),
    });
    return this.toDomain(record);
  }

  async delete(parentRoleId: string, childRoleId: string): Promise<void> {
    await this.prisma.roleInheritance.delete({
      where: {
        parentRoleId_childRoleId: { parentRoleId, childRoleId },
      },
    });
  }

  private toDomain(record: PrismaRoleInheritance): RoleInheritance {
    return RoleInheritance.create({
      id: record.id,
      parentRoleId: record.parentRoleId,
      childRoleId: record.childRoleId,
      createdAt: new Date(),
    });
  }

  private toPrisma(roleInheritance: RoleInheritance) {
    return {
      id: roleInheritance.id,
      parentRoleId: roleInheritance.parentRoleId,
      childRoleId: roleInheritance.childRoleId,
    };
  }
}
