import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { Role as PrismaRole } from '@generated/prisma/client';

@Injectable()
export class PrismaRoleRepository extends RoleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Role | null> {
    const record = await this.prisma.role.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByCode(
    organizationId: string | null,
    code: string,
  ): Promise<Role | null> {
    const record = await this.prisma.role.findFirst({
      where: { organizationId, code },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByOrganization(organizationId: string | null): Promise<Role[]> {
    const records = await this.prisma.role.findMany({
      where: { organizationId },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findAll(): Promise<Role[]> {
    const records = await this.prisma.role.findMany();
    return records.map((record) => this.toDomain(record));
  }

  async create(role: Role): Promise<Role> {
    const record = await this.prisma.role.create({
      data: this.toPrisma(role),
    });
    return this.toDomain(record);
  }

  async update(role: Role): Promise<Role> {
    const record = await this.prisma.role.update({
      where: { id: role.id },
      data: this.toPrisma(role),
    });
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({ where: { id } });
  }

  private toDomain(record: PrismaRole): Role {
    return Role.create({
      id: record.id,
      organizationId: record.organizationId,
      name: record.name,
      code: record.code,
      description: record.description,
      isSystem: record.isSystem,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toPrisma(role: Role) {
    return {
      id: role.id,
      organizationId: role.organizationId,
      name: role.name,
      code: role.code,
      description: role.description,
      isSystem: role.isSystem,
    };
  }
}
