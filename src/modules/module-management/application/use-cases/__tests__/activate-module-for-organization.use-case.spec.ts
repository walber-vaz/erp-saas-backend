import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import {
  OrganizationModuleErrorMessages,
  ModuleErrorMessages,
} from '@modules/module-management/domain/constants/error-messages';
import { OrganizationErrorMessages } from '@modules/organization/domain/constants/error-messages';
import { OrganizationModule } from '@modules/module-management/domain/entities/organization-module.entity';
import { OrganizationModuleRepository } from '@modules/module-management/domain/repositories/organization-module.repository';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { OrganizationRepository } from '@modules/organization/domain/repositories/organization.repository';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { Organization } from '@modules/organization/domain/entities/organization.entity';
import { ActivateModuleForOrganizationUseCase } from '../activate-module-for-organization.use-case';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';
const MODULE_ID = '660e8400-e29b-41d4-a716-446655440000';
const ORG_MODULE_ID = '770e8400-e29b-41d4-a716-446655440000';

const mockOrganizationModuleRepository: Mocked<OrganizationModuleRepository> = {
  findById: vi.fn(),
  findByOrganizationAndModule: vi.fn(),
  findByOrganization: vi.fn(),
  findByModule: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockModuleRepository: Mocked<ModuleRepository> = {
  findById: vi.fn(),
  findByCode: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockOrganizationRepository: Mocked<OrganizationRepository> = {
  findById: vi.fn(),
  findBySlug: vi.fn(),
  findByDocument: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const makeOrganization = () =>
  Organization.create({
    id: ORG_ID,
    name: 'Test Org',
    slug: 'test-org',
  });

const makeModule = (isActive: boolean = true) =>
  Module.create({
    id: MODULE_ID,
    code: 'FINANCE',
    name: 'Finance',
    isActive,
  });

const makeOrganizationModule = (isActive: boolean = false) =>
  OrganizationModule.create({
    id: ORG_MODULE_ID,
    organizationId: ORG_ID,
    moduleId: MODULE_ID,
    isActive,
  });

describe('ActivateModuleForOrganizationUseCase', () => {
  let useCase: ActivateModuleForOrganizationUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ActivateModuleForOrganizationUseCase(
      mockOrganizationModuleRepository,
      mockModuleRepository,
      mockOrganizationRepository,
    );
  });

  it('should activate a module for an organization (new entry)', async () => {
    mockOrganizationRepository.findById.mockResolvedValue(makeOrganization());
    mockModuleRepository.findById.mockResolvedValue(makeModule(true));
    mockOrganizationModuleRepository.findByOrganizationAndModule.mockResolvedValue(
      null,
    );
    mockOrganizationModuleRepository.create.mockImplementation(
      async (om) => om,
    );

    const result = await useCase.execute({
      organizationId: ORG_ID,
      moduleId: MODULE_ID,
    });

    expect(result).toBeInstanceOf(OrganizationModule);
    expect(result.organizationId).toBe(ORG_ID);
    expect(result.moduleId).toBe(MODULE_ID);
    expect(result.isActive).toBe(true);
    expect(result.activatedAt).toBeInstanceOf(Date);
    expect(mockOrganizationModuleRepository.create).toHaveBeenCalledTimes(1);
    expect(mockOrganizationModuleRepository.update).not.toHaveBeenCalled();
  });

  it('should activate a module for an organization (existing inactive)', async () => {
    const existingOrgModule = makeOrganizationModule(false);
    mockOrganizationRepository.findById.mockResolvedValue(makeOrganization());
    mockModuleRepository.findById.mockResolvedValue(makeModule(true));
    mockOrganizationModuleRepository.findByOrganizationAndModule.mockResolvedValue(
      existingOrgModule,
    );
    mockOrganizationModuleRepository.update.mockImplementation(
      async (om) => om,
    );

    const result = await useCase.execute({
      organizationId: ORG_ID,
      moduleId: MODULE_ID,
    });

    expect(result).toBeInstanceOf(OrganizationModule);
    expect(result.isActive).toBe(true);
    expect(result.activatedAt).toBeInstanceOf(Date);
    expect(mockOrganizationModuleRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
    );
    expect(mockOrganizationModuleRepository.create).not.toHaveBeenCalled();
  });

  it('should return existing module if already active', async () => {
    const existingOrgModule = makeOrganizationModule(true);
    mockOrganizationRepository.findById.mockResolvedValue(makeOrganization());
    mockModuleRepository.findById.mockResolvedValue(makeModule(true));
    mockOrganizationModuleRepository.findByOrganizationAndModule.mockResolvedValue(
      existingOrgModule,
    );

    const result = await useCase.execute({
      organizationId: ORG_ID,
      moduleId: MODULE_ID,
    });

    expect(result).toBe(existingOrgModule);
    expect(mockOrganizationModuleRepository.update).not.toHaveBeenCalled();
    expect(mockOrganizationModuleRepository.create).not.toHaveBeenCalled();
  });

  it('should throw an exception if organization not found', async () => {
    mockOrganizationRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ organizationId: ORG_ID, moduleId: MODULE_ID }),
    ).rejects.toThrow(new DomainException(OrganizationErrorMessages.NOT_FOUND));
    expect(mockOrganizationModuleRepository.create).not.toHaveBeenCalled();
  });

  it('should throw an exception if module not found', async () => {
    mockOrganizationRepository.findById.mockResolvedValue(makeOrganization());
    mockModuleRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ organizationId: ORG_ID, moduleId: MODULE_ID }),
    ).rejects.toThrow(new DomainException(ModuleErrorMessages.NOT_FOUND));
    expect(mockOrganizationModuleRepository.create).not.toHaveBeenCalled();
  });

  it('should throw an exception if module is not active globally', async () => {
    mockOrganizationRepository.findById.mockResolvedValue(makeOrganization());
    mockModuleRepository.findById.mockResolvedValue(makeModule(false)); // Inactive globally

    await expect(
      useCase.execute({ organizationId: ORG_ID, moduleId: MODULE_ID }),
    ).rejects.toThrow(
      new DomainException(
        OrganizationModuleErrorMessages.MODULE_NOT_ACTIVE_GLOBALLY,
      ),
    );
    expect(mockOrganizationModuleRepository.create).not.toHaveBeenCalled();
  });
});
