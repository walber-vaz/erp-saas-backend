import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { Organization } from '../../domain/entities/organization.entity';
import {
  FindAllParams,
  FindAllResult,
  OrganizationRepository,
} from '../../domain/repositories/organization.repository';
import { Organization as PrismaOrganization } from '@generated/prisma/client';

@Injectable()
export class PrismaOrganizationRepository extends OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Organization | null> {
    const record = await this.prisma.organization.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const record = await this.prisma.organization.findUnique({
      where: { slug },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByDocument(document: string): Promise<Organization | null> {
    const record = await this.prisma.organization.findUnique({
      where: { document },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(params?: FindAllParams): Promise<FindAllResult> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.organization.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organization.count(),
    ]);

    return {
      data: data.map((record) => this.toDomain(record)),
      total,
    };
  }

  async create(organization: Organization): Promise<Organization> {
    const record = await this.prisma.organization.create({
      data: this.toPrisma(organization),
    });
    return this.toDomain(record);
  }

  async update(organization: Organization): Promise<Organization> {
    const record = await this.prisma.organization.update({
      where: { id: organization.id },
      data: this.toPrisma(organization),
    });
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organization.delete({ where: { id } });
  }

  private toDomain(record: PrismaOrganization): Organization {
    return Organization.create({
      id: record.id,
      name: record.name,
      slug: record.slug,
      document: record.document,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toPrisma(organization: Organization) {
    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      document: organization.document,
      isActive: organization.isActive,
    };
  }
}
