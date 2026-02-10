import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { ModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { FindModuleUseCase } from '../find-module.use-case';

const MODULE_ID = '550e8400-e29b-41d4-a716-446655440000';

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
    code: 'FINANCE',
    name: 'Financeiro',
    description: 'Gestão financeira',
  });

describe('FindModuleUseCase', () => {
  let useCase: FindModuleUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindModuleUseCase(mockModuleRepository);
  });

  it('should return the module if found', async () => {
    const module = makeModule();
    mockModuleRepository.findById.mockResolvedValue(module);

    const result = await useCase.execute(MODULE_ID);

    expect(result).toBe(module);
    expect(mockModuleRepository.findById).toHaveBeenCalledWith(MODULE_ID);
  });

  it('should throw an exception if module not found', async () => {
    mockModuleRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      new DomainException(ModuleErrorMessages.NOT_FOUND),
    );
  });
});
