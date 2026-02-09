import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { RefreshToken } from '@modules/auth/domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { RefreshToken as PrismaRefreshToken } from '@generated/prisma/client';

@Injectable()
export class PrismaRefreshTokenRepository extends RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<RefreshToken | null> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByFamily(family: string): Promise<RefreshToken[]> {
    const records = await this.prisma.refreshToken.findMany({
      where: { family },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const records = await this.prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    const record = await this.prisma.refreshToken.create({
      data: this.toPrisma(refreshToken),
    });
    return this.toDomain(record);
  }

  async update(refreshToken: RefreshToken): Promise<RefreshToken> {
    const record = await this.prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: this.toPrisma(refreshToken),
    });
    return this.toDomain(record);
  }

  async revokeAllByFamily(family: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { family, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }

  private toDomain(record: PrismaRefreshToken): RefreshToken {
    return RefreshToken.create({
      id: record.id,
      userId: record.userId,
      token: record.token,
      family: record.family,
      isRevoked: record.isRevoked,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }

  private toPrisma(refreshToken: RefreshToken) {
    return {
      id: refreshToken.id,
      userId: refreshToken.userId,
      token: refreshToken.token,
      family: refreshToken.family,
      isRevoked: refreshToken.isRevoked,
      expiresAt: refreshToken.expiresAt,
    };
  }
}
