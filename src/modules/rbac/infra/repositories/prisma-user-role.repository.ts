import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { UserRole } from '@modules/rbac/domain/entities/user-role.entity';
import { UserRoleRepository } from '@modules/rbac/domain/repositories/user-role.repository';
import { UserRole as PrismaUserRole } from '@generated/prisma/client';

@Injectable()
export class PrismaUserRoleRepository extends UserRoleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByUserId(userId: string): Promise<UserRole[]> {
    const records = await this.prisma.userRole.findMany({
      where: { userId },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findByRoleId(roleId: string): Promise<UserRole[]> {
    const records = await this.prisma.userRole.findMany({
      where: { roleId },
    });
    return records.map((record) => this.toDomain(record));
  }

  async create(userRole: UserRole): Promise<UserRole> {
    const record = await this.prisma.userRole.create({
      data: this.toPrisma(userRole),
    });
    return this.toDomain(record);
  }

  async delete(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prisma.userRole.deleteMany({ where: { userId } });
  }

  private toDomain(record: PrismaUserRole): UserRole {
    return UserRole.create({
      id: record.id,
      userId: record.userId,
      roleId: record.roleId,
      assignedBy: record.assignedBy ?? '',
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }

  private toPrisma(userRole: UserRole) {
    return {
      id: userRole.id,
      userId: userRole.userId,
      roleId: userRole.roleId,
      assignedBy: userRole.assignedBy || null,
      expiresAt: userRole.expiresAt,
    };
  }
}
