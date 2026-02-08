import type { Mocked } from 'vitest';
import { Organization } from '../../../domain/entities/organization.entity';
import { OrganizationRepository } from '../../../domain/repositories/organization.repository';
import { ListOrganizationsUseCase } from '../list-organizations.use-case';

const mockRepository: Mocked<OrganizationRepository> = {
  findById: vi.fn(),
  findBySlug: vi.fn(),
  findByDocument: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('ListOrganizationsUseCase', () => {
  let useCase: ListOrganizationsUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListOrganizationsUseCase(mockRepository);
  });

  it('deve retornar lista paginada de organizações', async () => {
    const orgs = [
      Organization.create({ name: 'Empresa 1', slug: 'empresa-1' }),
      Organization.create({ name: 'Empresa 2', slug: 'empresa-2' }),
    ];
    mockRepository.findAll.mockResolvedValue({ data: orgs, total: 2 });

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('deve chamar findAll sem parâmetros quando não informados', async () => {
    mockRepository.findAll.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
  });
});
