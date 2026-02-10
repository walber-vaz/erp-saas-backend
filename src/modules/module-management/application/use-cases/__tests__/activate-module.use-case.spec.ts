import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { ModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { ActivateModuleUseCase } from '../activate-module.use-case';

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
    isActive: false,
    ...overrides,
  });

describe('ActivateModuleUseCase', () => {
  let useCase: ActivateModuleUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ActivateModuleUseCase(mockModuleRepository);
  });

  it('should activate an inactive module', async () => {
    const module = makeModule();
    mockModuleRepository.findById.mockResolvedValue(module);
    mockModuleRepository.update.mockImplementation(async (m) => m);

    const result = await useCase.execute(MODULE_ID);

    expect(result.isActive).toBe(true);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(mockModuleRepository.update).toHaveBeenCalledWith(module);
  });

  it('should return the module if it is already active', async () => {
    const module = makeModule({ isActive: true });
    mockModuleRepository.findById.mockResolvedValue(module);
    mockModuleRepository.update.mockImplementation(async (m) => m);

    const result = await useCase.execute(MODULE_ID);

    expect(result.isActive).toBe(true);
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
