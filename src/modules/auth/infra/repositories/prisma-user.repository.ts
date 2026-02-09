import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { User } from '@modules/auth/domain/entities/user.entity';
import {
  FindByOrganizationParams,
  FindByOrganizationResult,
  UserRepository,
} from '@modules/auth/domain/repositories/user.repository';
import { User as PrismaUser } from '@generated/prisma/client';

@Injectable()
export class PrismaUserRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(
    organizationId: string,
    email: string,
  ): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email: email.toLowerCase().trim(),
        },
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByOrganization(
    organizationId: string,
    params?: FindByOrganizationParams,
  ): Promise<FindByOrganizationResult> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { organizationId } }),
    ]);

    return {
      data: data.map((record) => this.toDomain(record)),
      total,
    };
  }

  async create(user: User): Promise<User> {
    const record = await this.prisma.user.create({
      data: this.toPrisma(user),
    });
    return this.toDomain(record);
  }

  async update(user: User): Promise<User> {
    const record = await this.prisma.user.update({
      where: { id: user.id },
      data: this.toPrisma(user),
    });
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private toDomain(record: PrismaUser): User {
    return User.create({
      id: record.id,
      organizationId: record.organizationId,
      name: record.name,
      email: record.email,
      passwordHash: record.passwordHash,
      isActive: record.isActive,
      lastLoginAt: record.lastLoginAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toPrisma(user: User) {
    return {
      id: user.id,
      organizationId: user.organizationId,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
