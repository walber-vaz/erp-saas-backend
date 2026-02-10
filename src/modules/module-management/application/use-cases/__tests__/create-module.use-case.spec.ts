import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { ModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { CreateModuleUseCase } from '../create-module.use-case';

const mockModuleRepository: Mocked<ModuleRepository> = {
  findById: vi.fn(),
  findByCode: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('CreateModuleUseCase', () => {
  let useCase: CreateModuleUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateModuleUseCase(mockModuleRepository);
  });

  it('should create a module successfully', async () => {
    mockModuleRepository.findByCode.mockResolvedValue(null);
    mockModuleRepository.create.mockImplementation(async (m) => m);

    const result = await useCase.execute({
      code: 'FINANCE',
      name: 'Financeiro',
      description: 'Gestão financeira',
      isActive: true,
    });

    expect(result).toBeInstanceOf(Module);
    expect(result.code).toBe('FINANCE');
    expect(result.name).toBe('Financeiro');
    expect(result.isActive).toBe(true);
    expect(mockModuleRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception if module code already exists', async () => {
    mockModuleRepository.findByCode.mockResolvedValue(
      Module.create({ code: 'FINANCE', name: 'Financeiro' }),
    );

    await expect(
      useCase.execute({ code: 'FINANCE', name: 'Financeiro' }),
    ).rejects.toThrow(
      new DomainException(ModuleErrorMessages.CODE_ALREADY_IN_USE),
    );

    expect(mockModuleRepository.create).not.toHaveBeenCalled();
  });

  it('should normalize the module code to uppercase', async () => {
    mockModuleRepository.findByCode.mockResolvedValue(null);
    mockModuleRepository.create.mockImplementation(async (m) => m);

    const result = await useCase.execute({
      code: 'finance',
      name: 'Financeiro',
    });

    expect(result.code).toBe('FINANCE');
    expect(mockModuleRepository.findByCode).toHaveBeenCalledWith('FINANCE');
  });
});
