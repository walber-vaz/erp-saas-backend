import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { ModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { DeactivateModuleUseCase } from '../deactivate-module.use-case';

const MODULE_ID = '550e8400-e29b-41d4-a716-446655440000';

const mockModuleRepository: Mocked<ModuleRepository> = {
  findById: vi.fn(),
  findByCode: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const makeModule = (overrides?: Partial<Module>) =>
  Module.create({
    id: MODULE_ID,
    code: 'FINANCE',
    name: 'Financeiro',
    isActive: true,
    ...overrides,
  });

describe('DeactivateModuleUseCase', () => {
  let useCase: DeactivateModuleUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new DeactivateModuleUseCase(mockModuleRepository);
  });

  it('should deactivate an active module', async () => {
    const module = makeModule();
    mockModuleRepository.findById.mockResolvedValue(module);
    mockModuleRepository.update.mockImplementation(async (m) => m);

    const result = await useCase.execute(MODULE_ID);

    expect(result.isActive).toBe(false);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(mockModuleRepository.update).toHaveBeenCalledWith(module);
  });

  it('should return the module if it is already inactive', async () => {
    const module = makeModule({ isActive: false });
    mockModuleRepository.findById.mockResolvedValue(module);
    mockModuleRepository.update.mockImplementation(async (m) => m);

    const result = await useCase.execute(MODULE_ID);

    expect(result.isActive).toBe(false);
    expect(mockModuleRepository.update).toHaveBeenCalledWith(module);
  });

  it('should throw an exception if module not found', async () => {
    mockModuleRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      new DomainException(ModuleErrorMessages.NOT_FOUND),
    );

    expect(mockModuleRepository.update).not.toHaveBeenCalled();
  });
});
