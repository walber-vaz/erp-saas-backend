import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { ModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';
import { OrganizationModule } from '@modules/module-management/domain/entities/organization-module.entity';
import { OrganizationModuleRepository } from '@modules/module-management/domain/repositories/organization-module.repository';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { CheckModuleAccessUseCase } from '../check-module-access.use-case';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';
const MODULE_ID = '660e8400-e29b-41d4-a716-446655440000';
const MODULE_CODE = 'FINANCE';

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

const makeModule = () =>
  Module.create({
    id: MODULE_ID,
    code: MODULE_CODE,
    name: 'Finance',
  });

const makeOrganizationModule = (isActive: boolean = true) =>
  OrganizationModule.create({
    organizationId: ORG_ID,
    moduleId: MODULE_ID,
    isActive,
  });

describe('CheckModuleAccessUseCase', () => {
  let useCase: CheckModuleAccessUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CheckModuleAccessUseCase(
      mockOrganizationModuleRepository,
      mockModuleRepository,
    );
  });

  it('should return true if module is active for the organization', async () => {
    mockModuleRepository.findByCode.mockResolvedValue(makeModule());
    mockOrganizationModuleRepository.findByOrganizationAndModule.mockResolvedValue(
      makeOrganizationModule(true),
    );

    const hasAccess = await useCase.execute(ORG_ID, MODULE_CODE);

    expect(hasAccess).toBe(true);
    expect(mockModuleRepository.findByCode).toHaveBeenCalledWith(MODULE_CODE);
    expect(
      mockOrganizationModuleRepository.findByOrganizationAndModule,
    ).toHaveBeenCalledWith(ORG_ID, MODULE_ID);
  });

  it('should return false if module is inactive for the organization', async () => {
    mockModuleRepository.findByCode.mockResolvedValue(makeModule());
    mockOrganizationModuleRepository.findByOrganizationAndModule.mockResolvedValue(
      makeOrganizationModule(false),
    );

    const hasAccess = await useCase.execute(ORG_ID, MODULE_CODE);

    expect(hasAccess).toBe(false);
  });

  it('should return false if module is not configured for the organization', async () => {
    mockModuleRepository.findByCode.mockResolvedValue(makeModule());
    mockOrganizationModuleRepository.findByOrganizationAndModule.mockResolvedValue(
      null,
    );

    const hasAccess = await useCase.execute(ORG_ID, MODULE_CODE);

    expect(hasAccess).toBe(false);
  });

  it('should throw an exception if module not found globally', async () => {
    mockModuleRepository.findByCode.mockResolvedValue(null);

    await expect(useCase.execute(ORG_ID, MODULE_CODE)).rejects.toThrow(
      new DomainException(ModuleErrorMessages.NOT_FOUND),
    );
    expect(
      mockOrganizationModuleRepository.findByOrganizationAndModule,
    ).not.toHaveBeenCalled();
  });
});
