import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';
import { OrganizationModule } from '@modules/module-management/domain/entities/organization-module.entity';
import { OrganizationModuleRepository } from '@modules/module-management/domain/repositories/organization-module.repository';
import { DeactivateModuleForOrganizationUseCase } from '../deactivate-module-for-organization.use-case';

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

const makeOrganizationModule = (isActive: boolean = true) =>
  OrganizationModule.create({
    id: ORG_MODULE_ID,
    organizationId: ORG_ID,
    moduleId: MODULE_ID,
    isActive,
  });

describe('DeactivateModuleForOrganizationUseCase', () => {
  let useCase: DeactivateModuleForOrganizationUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new DeactivateModuleForOrganizationUseCase(
      mockOrganizationModuleRepository,
    );
  });

  it('should deactivate an active organization module', async () => {
    const orgModule = makeOrganizationModule(true);
    mockOrganizationModuleRepository.findById.mockResolvedValue(orgModule);
    mockOrganizationModuleRepository.update.mockImplementation(
      async (om) => om,
    );

    await useCase.execute(ORG_MODULE_ID);

    expect(orgModule.isActive).toBe(false);
    expect(orgModule.deactivatedAt).toBeInstanceOf(Date);
    expect(mockOrganizationModuleRepository.update).toHaveBeenCalledWith(
      orgModule,
    );
  });

  it('should not try to deactivate an already inactive organization module', async () => {
    const orgModule = makeOrganizationModule(false);
    mockOrganizationModuleRepository.findById.mockResolvedValue(orgModule);

    await useCase.execute(ORG_MODULE_ID);

    expect(orgModule.isActive).toBe(false); // Should remain false
    expect(orgModule.deactivatedAt).toBeNull(); // Should not have been updated
    expect(mockOrganizationModuleRepository.update).not.toHaveBeenCalled();
  });

  it('should throw an exception if organization module not found', async () => {
    mockOrganizationModuleRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      new DomainException(OrganizationModuleErrorMessages.NOT_FOUND),
    );
    expect(mockOrganizationModuleRepository.update).not.toHaveBeenCalled();
  });
});
