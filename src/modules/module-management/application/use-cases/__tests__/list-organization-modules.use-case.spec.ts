import type { Mocked } from 'vitest';
import { OrganizationModule } from '@modules/module-management/domain/entities/organization-module.entity';
import { OrganizationModuleRepository } from '@modules/module-management/domain/repositories/organization-module.repository';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { ListOrganizationModulesUseCase } from '../list-organization-modules.use-case';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';
const MODULE_ID_1 = '660e8400-e29b-41d4-a716-446655440001';
const MODULE_ID_2 = '660e8400-e29b-41d4-a716-446655440002';

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

const makeOrganizationModule = (moduleId: string, isActive: boolean) =>
  OrganizationModule.create({
    organizationId: ORG_ID,
    moduleId: moduleId,
    isActive,
  });

const makeModule = (id: string, code: string) =>
  Module.create({
    id: id,
    code: code,
    name: `Module ${code}`,
    isActive: true,
  });

describe('ListOrganizationModulesUseCase', () => {
  let useCase: ListOrganizationModulesUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListOrganizationModulesUseCase(
      mockOrganizationModuleRepository,
      mockModuleRepository,
    );
  });

  it('should list organization modules with their corresponding module details', async () => {
    const orgModule1 = makeOrganizationModule(MODULE_ID_1, true);
    const orgModule2 = makeOrganizationModule(MODULE_ID_2, false);
    const module1 = makeModule(MODULE_ID_1, 'FINANCE');
    const module2 = makeModule(MODULE_ID_2, 'INVENTORY');

    mockOrganizationModuleRepository.findByOrganization.mockResolvedValue([
      orgModule1,
      orgModule2,
    ]);
    mockModuleRepository.findById
      .mockResolvedValueOnce(module1)
      .mockResolvedValueOnce(module2);

    const result = await useCase.execute(ORG_ID);

    expect(result).toHaveLength(2);
    expect(result[0].moduleId).toBe(MODULE_ID_1);
    expect(result[0].module.code).toBe('FINANCE');
    expect(result[1].moduleId).toBe(MODULE_ID_2);
    expect(result[1].module.code).toBe('INVENTORY');
    expect(
      mockOrganizationModuleRepository.findByOrganization,
    ).toHaveBeenCalledWith(ORG_ID, { isActive: undefined });
    expect(mockModuleRepository.findById).toHaveBeenCalledTimes(2);
  });

  it('should filter by isActive status', async () => {
    const orgModule1 = makeOrganizationModule(MODULE_ID_1, true);
    const module1 = makeModule(MODULE_ID_1, 'FINANCE');

    mockOrganizationModuleRepository.findByOrganization.mockResolvedValue([
      orgModule1,
    ]);
    mockModuleRepository.findById.mockResolvedValueOnce(module1);

    const result = await useCase.execute(ORG_ID, true);

    expect(result).toHaveLength(1);
    expect(result[0].isActive).toBe(true);
    expect(
      mockOrganizationModuleRepository.findByOrganization,
    ).toHaveBeenCalledWith(ORG_ID, { isActive: true });
  });

  it('should return empty array if no organization modules found', async () => {
    mockOrganizationModuleRepository.findByOrganization.mockResolvedValue([]);

    const result = await useCase.execute(ORG_ID);

    expect(result).toHaveLength(0);
  });

  it('should handle cases where associated module is not found (filter it out)', async () => {
    const orgModule1 = makeOrganizationModule(MODULE_ID_1, true);
    mockOrganizationModuleRepository.findByOrganization.mockResolvedValue([
      orgModule1,
    ]);
    mockModuleRepository.findById.mockResolvedValueOnce(null); // Module not found

    const result = await useCase.execute(ORG_ID);

    expect(result).toHaveLength(0);
  });
});
