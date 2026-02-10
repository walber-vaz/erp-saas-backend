import type { Mocked } from 'vitest';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { ListModulesUseCase } from '../list-modules.use-case';

const mockModuleRepository: Mocked<ModuleRepository> = {
  findById: vi.fn(),
  findByCode: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const makeModule = (code: string, isActive: boolean) =>
  Module.create({ code, name: `Module ${code}`, isActive });

describe('ListModulesUseCase', () => {
  let useCase: ListModulesUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListModulesUseCase(mockModuleRepository);
  });

  it('should list all modules when no filter is provided', async () => {
    const modules = [
      makeModule('FINANCE', true),
      makeModule('INVENTORY', false),
    ];
    mockModuleRepository.findAll.mockResolvedValue(modules);

    const result = await useCase.execute();

    expect(result).toEqual(modules);
    expect(mockModuleRepository.findAll).toHaveBeenCalledWith({
      isActive: undefined,
    });
  });

  it('should list only active modules when isActive is true', async () => {
    const activeModules = [makeModule('FINANCE', true)];
    mockModuleRepository.findAll.mockResolvedValue(activeModules);

    const result = await useCase.execute(true);

    expect(result).toEqual(activeModules);
    expect(mockModuleRepository.findAll).toHaveBeenCalledWith({
      isActive: true,
    });
  });

  it('should list only inactive modules when isActive is false', async () => {
    const inactiveModules = [makeModule('INVENTORY', false)];
    mockModuleRepository.findAll.mockResolvedValue(inactiveModules);

    const result = await useCase.execute(false);

    expect(result).toEqual(inactiveModules);
    expect(mockModuleRepository.findAll).toHaveBeenCalledWith({
      isActive: false,
    });
  });
});
