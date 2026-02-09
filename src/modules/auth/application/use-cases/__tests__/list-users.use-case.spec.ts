import type { Mocked } from 'vitest';
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { ListUsersUseCase } from '../list-users.use-case';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

const mockUserRepository: Mocked<UserRepository> = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByOrganization: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListUsersUseCase(mockUserRepository);
  });

  it('deve listar usuários de uma organização', async () => {
    const users = [
      User.create({
        organizationId: ORG_ID,
        name: 'João',
        email: 'joao@empresa.com',
        passwordHash: 'hash1',
      }),
      User.create({
        organizationId: ORG_ID,
        name: 'Maria',
        email: 'maria@empresa.com',
        passwordHash: 'hash2',
      }),
    ];
    mockUserRepository.findByOrganization.mockResolvedValue({
      data: users,
      total: 2,
    });

    const result = await useCase.execute(ORG_ID, { page: 1, limit: 10 });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(mockUserRepository.findByOrganization).toHaveBeenCalledWith(ORG_ID, {
      page: 1,
      limit: 10,
    });
  });

  it('deve listar sem parâmetros de paginação', async () => {
    mockUserRepository.findByOrganization.mockResolvedValue({
      data: [],
      total: 0,
    });

    const result = await useCase.execute(ORG_ID);

    expect(result.data).toHaveLength(0);
    expect(mockUserRepository.findByOrganization).toHaveBeenCalledWith(
      ORG_ID,
      undefined,
    );
  });
});
