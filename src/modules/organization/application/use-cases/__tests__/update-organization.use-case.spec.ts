import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationErrorMessages } from '../../../domain/constants/error-messages';
import { Organization } from '../../../domain/entities/organization.entity';
import { OrganizationRepository } from '../../../domain/repositories/organization.repository';
import { UpdateOrganizationUseCase } from '../update-organization.use-case';

const mockRepository: Mocked<OrganizationRepository> = {
  findById: vi.fn(),
  findBySlug: vi.fn(),
  findByDocument: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const makeOrganization = (overrides = {}) =>
  Organization.create({
    name: 'Empresa Teste',
    slug: 'empresa-teste',
    ...overrides,
  });

describe('UpdateOrganizationUseCase', () => {
  let useCase: UpdateOrganizationUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpdateOrganizationUseCase(mockRepository);
  });

  it('deve atualizar o nome com sucesso', async () => {
    const org = makeOrganization();
    mockRepository.findById.mockResolvedValue(org);
    mockRepository.update.mockImplementation(async (o) => o);

    const result = await useCase.execute(org.id, { name: 'Novo Nome' });

    expect(result.name).toBe('Novo Nome');
    expect(mockRepository.update).toHaveBeenCalledTimes(1);
  });

  it('deve atualizar o slug validando unicidade', async () => {
    const org = makeOrganization();
    mockRepository.findById.mockResolvedValue(org);
    mockRepository.findBySlug.mockResolvedValue(null);
    mockRepository.update.mockImplementation(async (o) => o);

    const result = await useCase.execute(org.id, { slug: 'novo-slug' });

    expect(result.slug).toBe('novo-slug');
    expect(mockRepository.findBySlug).toHaveBeenCalledWith('novo-slug');
  });

  it('deve lançar exceção quando organização não encontrada', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('invalid-id', { name: 'Teste' }),
    ).rejects.toThrow(new DomainException(OrganizationErrorMessages.NOT_FOUND));
  });

  it('deve lançar exceção quando novo slug já existe', async () => {
    const org = makeOrganization();
    const other = makeOrganization({ slug: 'outro-slug' });
    mockRepository.findById.mockResolvedValue(org);
    mockRepository.findBySlug.mockResolvedValue(other);

    await expect(
      useCase.execute(org.id, { slug: 'outro-slug' }),
    ).rejects.toThrow(
      new DomainException(OrganizationErrorMessages.SLUG_TAKEN),
    );
  });

  it('deve lançar exceção quando novo documento já existe', async () => {
    const org = makeOrganization();
    const other = makeOrganization({ document: '11222333000181' });
    mockRepository.findById.mockResolvedValue(org);
    mockRepository.findByDocument.mockResolvedValue(other);

    await expect(
      useCase.execute(org.id, { document: '11222333000181' }),
    ).rejects.toThrow(
      new DomainException(OrganizationErrorMessages.DOCUMENT_TAKEN),
    );
  });

  it('não deve validar unicidade de slug quando não alterado', async () => {
    const org = makeOrganization();
    mockRepository.findById.mockResolvedValue(org);
    mockRepository.update.mockImplementation(async (o) => o);

    await useCase.execute(org.id, { slug: org.slug });

    expect(mockRepository.findBySlug).not.toHaveBeenCalled();
  });
});
