import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationErrorMessages } from '../../../domain/constants/error-messages';
import { Organization } from '../../../domain/entities/organization.entity';
import { OrganizationRepository } from '../../../domain/repositories/organization.repository';
import { FindOrganizationUseCase } from '../find-organization.use-case';

const mockRepository: Mocked<OrganizationRepository> = {
  findById: vi.fn(),
  findBySlug: vi.fn(),
  findByDocument: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('FindOrganizationUseCase', () => {
  let useCase: FindOrganizationUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindOrganizationUseCase(mockRepository);
  });

  it('deve retornar a organização quando encontrada', async () => {
    const org = Organization.create({ name: 'Empresa', slug: 'empresa' });
    mockRepository.findById.mockResolvedValue(org);

    const result = await useCase.execute(org.id);

    expect(result).toBe(org);
    expect(mockRepository.findById).toHaveBeenCalledWith(org.id);
  });

  it('deve lançar exceção quando não encontrada', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id')).rejects.toThrow(
      new DomainException(OrganizationErrorMessages.NOT_FOUND),
    );
  });
});
