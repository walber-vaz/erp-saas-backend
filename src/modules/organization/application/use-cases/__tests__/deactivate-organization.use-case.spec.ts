import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationErrorMessages } from '../../../domain/constants/error-messages';
import { Organization } from '../../../domain/entities/organization.entity';
import { OrganizationRepository } from '../../../domain/repositories/organization.repository';
import { DeactivateOrganizationUseCase } from '../deactivate-organization.use-case';

const mockRepository: Mocked<OrganizationRepository> = {
  findById: vi.fn(),
  findBySlug: vi.fn(),
  findByDocument: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('DeactivateOrganizationUseCase', () => {
  let useCase: DeactivateOrganizationUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new DeactivateOrganizationUseCase(mockRepository);
  });

  it('deve desativar a organização com sucesso', async () => {
    const org = Organization.create({ name: 'Empresa', slug: 'empresa' });
    mockRepository.findById.mockResolvedValue(org);
    mockRepository.update.mockImplementation(async (o) => o);

    await useCase.execute(org.id);

    expect(org.isActive).toBe(false);
    expect(mockRepository.update).toHaveBeenCalledTimes(1);
  });

  it('deve lançar exceção quando organização não encontrada', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id')).rejects.toThrow(
      new DomainException(OrganizationErrorMessages.NOT_FOUND),
    );
  });

  it('deve lançar exceção quando organização já está inativa', async () => {
    const org = Organization.create({
      name: 'Empresa',
      slug: 'empresa',
      isActive: false,
    });
    mockRepository.findById.mockResolvedValue(org);

    await expect(useCase.execute(org.id)).rejects.toThrow(
      new DomainException(OrganizationErrorMessages.ALREADY_INACTIVE),
    );

    expect(mockRepository.update).not.toHaveBeenCalled();
  });
});
