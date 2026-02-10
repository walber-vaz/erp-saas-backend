import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { ModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { UpdateModuleUseCase } from '../update-module.use-case';

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
    description: 'Gestão financeira',
    isActive: true,
    ...overrides,
  });

describe('UpdateModuleUseCase', () => {
  let useCase: UpdateModuleUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpdateModuleUseCase(mockModuleRepository);
  });

  it('should update module properties successfully', async () => {
    const module = makeModule();
    mockModuleRepository.findById.mockResolvedValue(module);
    mockModuleRepository.update.mockImplementation(async (m) => m);

    const updatedName = 'Novo Financeiro';
    const updatedDescription = 'Nova descrição';
    const result = await useCase.execute(MODULE_ID, {
      name: updatedName,
      description: updatedDescription,
    });

    expect(result).toBeInstanceOf(Module);
    expect(result.name).toBe(updatedName);
    expect(result.description).toBe(updatedDescription);
    expect(mockModuleRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: updatedName,
        description: updatedDescription,
      }),
    );
  });

  it('should activate module if isActive is true in DTO', async () => {
    const module = makeModule({ isActive: false });
    mockModuleRepository.findById.mockResolvedValue(module);
    mockModuleRepository.update.mockImplementation(async (m) => m);

    const result = await useCase.execute(MODULE_ID, { isActive: true });

    expect(result.isActive).toBe(true);
  });

  it('should deactivate module if isActive is false in DTO', async () => {
    const module = makeModule({ isActive: true });
    mockModuleRepository.findById.mockResolvedValue(module);
    mockModuleRepository.update.mockImplementation(async (m) => m);

    const result = await useCase.execute(MODULE_ID, { isActive: false });

    expect(result.isActive).toBe(false);
  });

  it('should throw an exception if module not found', async () => {
    mockModuleRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent-id', { name: 'New Name' }),
    ).rejects.toThrow(new DomainException(ModuleErrorMessages.NOT_FOUND));

    expect(mockModuleRepository.update).not.toHaveBeenCalled();
  });
});
