import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationErrorMessages } from '../../../domain/constants/error-messages';
import { Organization } from '../../../domain/entities/organization.entity';
import { OrganizationRepository } from '../../../domain/repositories/organization.repository';
import { CreateOrganizationUseCase } from '../create-organization.use-case';

const mockRepository: Mocked<OrganizationRepository> = {
  findById: vi.fn(),
  findBySlug: vi.fn(),
  findByDocument: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('CreateOrganizationUseCase', () => {
  let useCase: CreateOrganizationUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateOrganizationUseCase(mockRepository);
  });

  it('deve criar uma organização com sucesso', async () => {
    mockRepository.findBySlug.mockResolvedValue(null);
    mockRepository.create.mockImplementation(async (org) => org);

    const result = await useCase.execute({
      name: 'Empresa Teste',
      slug: 'empresa-teste',
    });

    expect(result).toBeInstanceOf(Organization);
    expect(result.name).toBe('Empresa Teste');
    expect(result.slug).toBe('empresa-teste');
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it('deve criar organização com documento', async () => {
    mockRepository.findBySlug.mockResolvedValue(null);
    mockRepository.findByDocument.mockResolvedValue(null);
    mockRepository.create.mockImplementation(async (org) => org);

    const result = await useCase.execute({
      name: 'Empresa Teste',
      slug: 'empresa-teste',
      document: '11222333000181',
    });

    expect(result.document).toBe('11222333000181');
    expect(mockRepository.findByDocument).toHaveBeenCalledWith(
      '11222333000181',
    );
  });

  it('deve lançar exceção quando slug já existe', async () => {
    const existing = Organization.create({
      name: 'Outra',
      slug: 'empresa-teste',
    });
    mockRepository.findBySlug.mockResolvedValue(existing);

    await expect(
      useCase.execute({ name: 'Empresa Teste', slug: 'empresa-teste' }),
    ).rejects.toThrow(
      new DomainException(OrganizationErrorMessages.SLUG_TAKEN),
    );

    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('deve lançar exceção quando documento já existe', async () => {
    const existing = Organization.create({
      name: 'Outra',
      slug: 'outra',
      document: '11222333000181',
    });
    mockRepository.findBySlug.mockResolvedValue(null);
    mockRepository.findByDocument.mockResolvedValue(existing);

    await expect(
      useCase.execute({
        name: 'Empresa Teste',
        slug: 'empresa-teste',
        document: '11222333000181',
      }),
    ).rejects.toThrow(
      new DomainException(OrganizationErrorMessages.DOCUMENT_TAKEN),
    );

    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
